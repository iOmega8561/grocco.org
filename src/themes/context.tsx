import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import { applyTheme } from "./apply";
import { rememberOff } from "./registry";
import type { SlotName, ThemeDefinition, ThemeModule } from "./types";

type ThemeState = {
  /** The theme that applies today, on or off. */
  scheduled: ThemeDefinition | null;
  /** The theme in use right now: `scheduled` unless the reader turned it off. */
  active: ThemeDefinition | null;
  module: ThemeModule | null;
  setOn: (on: boolean) => void;
};

const ThemeContext = createContext<ThemeState>({ scheduled: null, active: null, module: null, setOn: () => {} });

type Props = {
  scheduled: ThemeDefinition | null;
  /** Already loaded by `main.tsx` when the theme starts on, so the first paint is themed. */
  module: ThemeModule | null;
  children: ReactNode;
};

export function ThemeProvider({ scheduled, module: initialModule, children }: Props) {
  const [module, setModule] = useState(initialModule);
  const [on, setOnState] = useState(initialModule !== null);

  const setOn = useCallback(
    (next: boolean) => {
      if (!scheduled) return;
      rememberOff(scheduled, !next);
      if (!next) {
        applyTheme(null);
        setOnState(false);
        return;
      }
      // Turned back on: its code may not have been loaded yet.
      (module ? Promise.resolve(module) : scheduled.load())
        .then((loaded) => {
          setModule(loaded);
          applyTheme(scheduled);
          setOnState(true);
        })
        .catch(() => {});
    },
    [scheduled, module],
  );

  const value = useMemo<ThemeState>(
    () => ({ scheduled, active: on ? scheduled : null, module: on ? module : null, setOn }),
    [scheduled, on, module, setOn],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeState {
  return useContext(ThemeContext);
}

/**
 * A place where the active theme may put a decoration. It covers its host, which must be
 * positioned, and renders nothing at all while no theme fills it.
 */
export function ThemeSlot({ name }: { name: SlotName }) {
  const { module } = useTheme();
  const { pathname } = useLocation();
  const Fill = module?.slots?.[name];
  if (!Fill) return null;
  return (
    <div className="theme-slot" data-slot={name} aria-hidden="true">
      <Fill slot={name} pathname={pathname} />
    </div>
  );
}

/** The active theme's layer over the whole viewport, if it has one. */
export function ThemeOverlay() {
  const { module } = useTheme();
  const Overlay = module?.overlay;
  if (!Overlay) return null;
  return (
    <div className="theme-overlay" aria-hidden="true">
      <Overlay />
    </div>
  );
}

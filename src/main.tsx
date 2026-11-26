import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/project.css";
import { App } from "./App";
import { resolveTheme } from "./themes/registry";
import { applyTheme } from "./themes/apply";
import { ThemeProvider } from "./themes/context";
import type { ThemeModule } from "./themes/types";

/** How long the first render waits for a theme's code and CSS. */
const themeWait = 2500;

// The theme's code and CSS load before the first render, so the page never shows unthemed first.
// If they can't load in time, the site starts without the theme rather than staying blank, and the
// footer still offers to turn it on; it does not switch on by itself later, in the middle of reading.
const { scheduled, off, previewing } = resolveTheme();
const timeout = new Promise<null>((resolve) => window.setTimeout(() => resolve(null), themeWait));
const module: ThemeModule | null =
  scheduled && !off ? await Promise.race([scheduled.load().catch(() => null), timeout]) : null;
if (module) applyTheme(scheduled);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider scheduled={scheduled} previewing={previewing} module={module}>
      <App />
    </ThemeProvider>
  </StrictMode>,
);

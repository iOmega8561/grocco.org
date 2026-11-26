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

// The theme's code and CSS load before the first render, so the page never shows unthemed first.
// If they can't load, the site simply starts without the theme.
const { scheduled, off, previewing } = resolveTheme();
const module: ThemeModule | null = scheduled && !off ? await scheduled.load().catch(() => null) : null;
if (module) applyTheme(scheduled);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider scheduled={scheduled} previewing={previewing} module={module}>
      <App />
    </ThemeProvider>
  </StrictMode>,
);

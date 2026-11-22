import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { preferredLanguage } from "./i18n/languages";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { ProjectPage } from "./pages/ProjectPage";
import { NotFound } from "./pages/NotFound";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to={`/${preferredLanguage()}`} replace /> },
  {
    path: "/:lang",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "work/:slug", element: <ProjectPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}

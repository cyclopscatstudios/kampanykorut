import "reflect-metadata";
import "./di/container";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./AppLayout";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

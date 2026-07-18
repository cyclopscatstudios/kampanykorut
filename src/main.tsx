import "reflect-metadata";
import "./di/container";
import "./logic/i18n/i18n";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import { initDevApi } from "./initApi";
import { router } from "./router";

initDevApi();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster />
    <RouterProvider router={router} />
  </StrictMode>,
);

import "reflect-metadata";
import "./di/container";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap-icons/font/bootstrap-icons.css";
import App from "./App.tsx";
import DevApp from "./dev/DevApp.tsx";
import "./index.css";

const isDevApp =
  import.meta.env.DEV && window.location.pathname.startsWith("/dev");

createRoot(document.getElementById("root")!).render(
  <StrictMode>{isDevApp ? <DevApp /> : <App />}</StrictMode>,
);

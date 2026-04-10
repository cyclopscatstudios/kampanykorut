import "reflect-metadata";
import "./di/container";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import { GameStateEngine } from "@/logic/application";
import { container } from "tsyringe";
import { AppRoot } from "./AppRoute.tsx";

const gameStateEngine = container.resolve(GameStateEngine);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRoot gameStateEngine={gameStateEngine} />
  </StrictMode>,
);

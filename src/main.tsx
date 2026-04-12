import "reflect-metadata";
import "./i18n";
import "./di/container";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import { GameStateEngine, MenuStateMachine } from "@/logic/application";
import { container } from "tsyringe";
import { AppRoot } from "./AppRoute.tsx";

const gameStateEngine = container.resolve(GameStateEngine);
const menuStateMachine = container.resolve(MenuStateMachine);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRoot
      gameStateEngine={gameStateEngine}
      menuStateMachine={menuStateMachine}
    />
  </StrictMode>,
);

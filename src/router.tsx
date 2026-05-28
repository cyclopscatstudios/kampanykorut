import { createBrowserRouter } from "react-router";
import { MainGameScreenWrapper, NewGameLayout, RootLayout } from "./AppLayout";
import { sideSelectorLoader } from "./components/loaders/sideSelector.loader";
import { ClassicModeSelectorMenu } from "./components/ui/menu/ClassicModeSelectorMenu";
import { MainMenu } from "./components/ui/menu/MainMenu";
import { NewGameMenu } from "./components/ui/menu/NewGameMenu";
import { SettingsMenu } from "./components/ui/menu/SettingsMenu";
import { SideSelectorMenu } from "./components/ui/menu/SideSelectorMenu";
import { LoadSavedSessionsMenu } from "./components/ui/menu/LoadSavedGamesMenu";
import { newGameSelectorLoader } from "./components/loaders/newGameSelector.loader";
import { FinalResultScreen } from "./components/ui/gameplay/FinalResultScreen/EndResultScreen";
import { finalResultLoader } from "./components/loaders/finalResult.loader";
import { mainMenuLoader } from "./components/loaders/mainMenu.loader";
import { rootLoader } from "./components/loaders/route.loader";
import { mainGameScreenLoader } from "./components/loaders/mainGameScreen.loader";
import { ErrorPage } from "./components/ErrorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    loader: rootLoader,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <MainMenu />, loader: mainMenuLoader },
      { path: "settings", element: <SettingsMenu /> },
      { path: "load-game", element: <LoadSavedSessionsMenu /> },
      {
        path: "new-game",
        element: <NewGameLayout />,
        children: [
          { index: true, element: <NewGameMenu /> },
          {
            path: "classic",
            children: [
              {
                index: true,
                element: <ClassicModeSelectorMenu />,
                loader: newGameSelectorLoader,
              },
              {
                path: "sides/:campaignId",
                element: <SideSelectorMenu />,
                loader: sideSelectorLoader,
              },
            ],
          },
        ],
      },
      {
        path: "game/:id",
        element: <MainGameScreenWrapper />,
        loader: mainGameScreenLoader,
      },
      {
        path: "game/:id/end-results",
        element: <FinalResultScreen />,
        loader: finalResultLoader,
      },
    ],
  },
]);

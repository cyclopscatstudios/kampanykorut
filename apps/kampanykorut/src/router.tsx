import { createBrowserRouter } from "react-router";
import { MainGameScreenWrapper, NewGameLayout, RootLayout } from "./AppLayout";
import { ErrorPage } from "./components/ErrorPage";
import { finalResultLoader } from "./components/loaders/finalResult.loader";
import { mainGameScreenLoader } from "./components/loaders/mainGameScreen.loader";
import { mainMenuLoader } from "./components/loaders/mainMenu.loader";
import { newGameSelectorLoader } from "./components/loaders/newGameSelector.loader";
import { rootLoader } from "./components/loaders/route.loader";
import { sideSelectorLoader } from "./components/loaders/sideSelector.loader";
import { FinalResultScreen } from "./components/ui/gameplay/FinalResultScreen/EndResultScreen";
import { AboutMenu } from "./components/ui/menu/AboutMenu";
import { ClassicModeSelectorMenu } from "./components/ui/menu/ClassicModeSelectorMenu";
import { LandingPage } from "./components/ui/menu/LandingPage";
import { LoadSavedSessionsMenu } from "./components/ui/menu/LoadSavedGamesMenu";
import { MainMenu } from "./components/ui/menu/MainMenu";
import { NewGameMenu } from "./components/ui/menu/NewGameMenu";
import { SettingsMenu } from "./components/ui/menu/SettingsMenu";
import { SideSelectorMenu } from "./components/ui/menu/SideSelectorMenu";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    element: <RootLayout />,
    loader: rootLoader,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <div>loading...</div>,
    children: [
      { path: "menu", element: <MainMenu />, loader: mainMenuLoader },
      { path: "settings", element: <SettingsMenu /> },
      { path: "load-game", element: <LoadSavedSessionsMenu /> },
      { path: "about", element: <AboutMenu /> },
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

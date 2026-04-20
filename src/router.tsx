import { createBrowserRouter } from "react-router";
import { MainGameScreenWrapper, NewGameLayout, RootLayout } from "./AppLayout";
import { sideSelectorLoader } from "./components/loaders/sideSelector.loader";
import { ClassicModeSelectorMenu } from "./components/ui/menu/ClassicModeSelectorMenu";
import { MainMenu } from "./components/ui/menu/MainMenu";
import { NewGameMenu } from "./components/ui/menu/NewGameMenu";
import { SettingsMenu } from "./components/ui/menu/SettingsMenu";
import { SideSelectorMenu } from "./components/ui/menu/SideSelectorMenu";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <div>error</div>,
    children: [
      { index: true, element: <MainMenu /> },
      { path: "settings", element: <SettingsMenu /> },

      {
        path: "new-game",
        element: <NewGameLayout />,
        children: [
          { index: true, element: <NewGameMenu /> },

          {
            path: "classic",
            children: [
              { index: true, element: <ClassicModeSelectorMenu /> },
              {
                path: "sides/:campaignId",
                element: <SideSelectorMenu />,
                loader: sideSelectorLoader,
              },
            ],
          },
        ],
      },

      { path: "game/:id", element: <MainGameScreenWrapper /> },
    ],
  },
]);

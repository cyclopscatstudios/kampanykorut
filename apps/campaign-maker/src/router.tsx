import { createBrowserRouter } from "react-router";
import { MainMenu } from "./components/ui/menu/MainMenu";

export const router = createBrowserRouter([
  {
    path: "/",
    hydrateFallbackElement: <div>loading...</div>,
    children: [{ index: true, element: <MainMenu /> }],
  },
]);

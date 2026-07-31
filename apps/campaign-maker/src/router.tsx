import { createBrowserRouter } from "react-router";
import { MainMenu } from "./components/ui/menu/MainMenu";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainMenu />,
        children: [
            { index: true, element: <MainMenu /> }
        ]
    }
])
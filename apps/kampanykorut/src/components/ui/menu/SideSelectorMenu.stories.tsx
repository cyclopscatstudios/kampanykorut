import type { Story } from "@ladle/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { SideSelectorMenu } from "./SideSelectorMenu";

export const Default: Story = () => {
  const router = createMemoryRouter([
    {
      path: "new-game",
      element: <SideSelectorMenu />,
    },
  ]);
  return <RouterProvider router={router} />;
};

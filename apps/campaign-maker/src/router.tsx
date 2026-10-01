import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { MainMenu } from "./components/ui/menu/MainMenu";
import { ElectionConfigMaker } from "./components/ui/config/ElectionConfigMaker";
import { NewCampaignRedirect } from "./components/ui/config/NewCampaignRedirect";
import { BasicsStep } from "./components/ui/config/steps/BasicsStep";
import { PlaceholderStep } from "./components/ui/config/steps/PlaceholderStep";
import { WIZARD_STEPS } from "./components/ui/config/wizardSteps";
import classNames from "classnames";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    hydrateFallbackElement: <div>loading...</div>,
    children: [
      { index: true, element: <MainMenu /> },
      { path: "new-campaign", element: <NewCampaignRedirect /> },
      {
        path: "new-campaign/:draftId",
        element: <ElectionConfigMaker />,
        children: [
          {
            index: true,
            element: <Navigate to={WIZARD_STEPS[0].path} replace />,
          },
          ...WIZARD_STEPS.map((step) => ({
            path: step.path,
            element:
              step.id === "basics" ? <BasicsStep /> : <PlaceholderStep />,
          })),
        ],
      },
    ],
  },
]);

function RootLayout() {
  return (
    <div className="flex flex-col w-screen h-screen bg-white">
      <div className="flex-1 min-h-0">
        <div className="relative w-full h-full">
          <div className="absolute inset-0" />
          <div className="flex items-center justify-center w-full h-full">
            <div
              className={classNames(
                "size-full md:w-[1200px] md:h-[750px] bg-white rounded-sm border border-gray-300 relative overflow-hidden",
              )}
            >
              <div className="flex items-center justify-center w-full h-full">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

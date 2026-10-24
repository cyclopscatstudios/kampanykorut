import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { MainMenu } from "./components/ui/menu/MainMenu";
import { ElectionConfigMaker } from "./components/ui/config/ElectionConfigMaker";
import { NewCampaignRedirect } from "./components/ui/config/NewCampaignRedirect";
import { BasicsStep } from "./components/ui/config/steps/BasicsStep";
import { PartiesStep } from "./components/ui/config/steps/PartiesStep";
import { CandidateStep } from "./components/ui/config/steps/CandidateStep";
import { NarrativeStep } from "./components/ui/config/steps/NarrativeStep";
import { SummaryStep } from "./components/ui/config/steps/SummaryStep";
import { WIZARD_STEPS } from "./components/ui/config/wizardSteps";
import classNames from "classnames";

function getStepElement(stepId: string) {
  switch (stepId) {
    case "basics":
      return <BasicsStep />;
    case "parties":
      return <PartiesStep />;
    case "candidates":
      return <CandidateStep />;
    case "materials":
      return <NarrativeStep />;
    case "summary":
      return <SummaryStep />;
    default:
      return <Navigate to={WIZARD_STEPS[0].path} replace />;
  }
}

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
            element: getStepElement(step.id),
          })),
        ],
      },
    ],
  },
], { basename: import.meta.env.BASE_URL });

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

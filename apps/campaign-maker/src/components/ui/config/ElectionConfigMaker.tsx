import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CampaignDraftProvider,
  useCampaignDraft,
} from "./CampaignDraftContext";
import { downloadCampaignDraft } from "./exportCampaignDraft";
import { WizardFooter } from "./WizardFooter";
import { WizardHeader } from "./WizardHeader";
import { WizardSidebar } from "./WizardSidebar";
import { getStepIndexFromPath, WIZARD_STEPS } from "./wizardSteps";

export function ElectionConfigMaker() {
  const { draftId } = useParams<{ draftId: string }>();
  if (!draftId) return null;

  return (
    <CampaignDraftProvider draftId={draftId} key={draftId}>
      <ElectionConfigMakerLayout />
    </CampaignDraftProvider>
  );
}

function ElectionConfigMakerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { draft } = useCampaignDraft();

  const currentIndex = getStepIndexFromPath(location.pathname);
  const nextStep = WIZARD_STEPS[currentIndex + 1];

  const handleNext = () => {
    if (nextStep) {
      navigate(nextStep.path);
    } else {
      downloadCampaignDraft(draft);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-white text-slate-900">
      <WizardHeader />
      <div className="flex min-h-0 flex-1">
        <WizardSidebar currentIndex={currentIndex} />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-10 py-8">
          <Outlet />
        </div>
      </div>
      <WizardFooter
        currentIndex={currentIndex}
        total={WIZARD_STEPS.length}
        nextStep={nextStep}
        onCancel={() => navigate("/")}
        onNext={handleNext}
      />
    </div>
  );
}

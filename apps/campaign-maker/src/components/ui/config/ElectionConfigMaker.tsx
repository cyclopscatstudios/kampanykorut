import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CampaignDraftProvider,
  useCampaignDraft,
} from "./CampaignBundleContext";
import { downloadText } from "../../../logic/bundle/campaignBundle";
import { slugify } from "./slugify";
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
  const { draft, exportText } = useCampaignDraft();

  const currentIndex = getStepIndexFromPath(location.pathname);
  const nextStep = WIZARD_STEPS[currentIndex + 1];

  const handleNext = () => {
    if (nextStep) {
      navigate(nextStep.path);
    } else {
      const exported = exportText();
      if (exported)
        downloadText(
          exported,
          `${slugify(draft.title) || "kampany"}.kampany.json`,
        );
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-white text-slate-900">
      <WizardHeader />
      <div className="flex flex-1 items-center justify-center p-6 text-center md:hidden">
        <div>
          <h1 className="text-2xl font-extrabold">
            A szerkesztő asztali gépet igényel
          </h1>
          <p className="mt-3 text-slate-600">
            Mobilon nem módosítjuk a vázlatodat. A fejléc Export gombjával
            biztonsági másolatot menthetsz.
          </p>
        </div>
      </div>
      <div className="hidden min-h-0 flex-1 md:flex">
        <WizardSidebar currentIndex={currentIndex} />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-10 py-8">
          <Outlet />
        </div>
      </div>
      <div className="hidden md:block">
        <WizardFooter
          currentIndex={currentIndex}
          total={WIZARD_STEPS.length}
          nextStep={nextStep}
          onCancel={() => navigate("/")}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}

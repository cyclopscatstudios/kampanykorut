import { Icon } from "@/shared/ui";
import { Button } from "@/shared/ui/Button";
import { useTranslate } from "@/shared/logic/hooks";
import { useCampaignDraft } from "./CampaignDraftContext";
import { downloadCampaignDraft } from "./exportCampaignDraft";

export function WizardHeader() {
  const { draft } = useCampaignDraft();
  const t = useTranslate();

  return (
    <header className="flex items-center justify-between border-b border-slate-100 px-8 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-base font-extrabold text-white">
          K
        </div>
        <div className="text-lg font-extrabold text-slate-900">
          Kampány<span className="text-brand-700">körút</span>
        </div>
        <span className="ml-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
          {t("wizard.header.modMakerBadge")}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5">
          <span className="h-3 w-3 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-orange-400" />
          <div className="leading-tight">
            <div className="text-sm font-bold text-slate-900">
              {draft.year || "—"}
            </div>
            <div className="text-xs text-slate-500">
              {draft.title || t("wizard.header.untitledCampaign")}
            </div>
          </div>
        </div>

        <Button variant="secondary" size="md" iconOnly testId="wizard-settings">
          <Icon
            name="gear"
            color="currentColor"
            className="text-blue-900"
            size="sm"
          />
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={() => downloadCampaignDraft(draft)}
          testId="wizard-export"
        >
          <Icon
            name="download"
            color="currentColor"
            className="text-slate-50"
            size="sm"
          />
          <span>{t("wizard.header.exportButton")}</span>
        </Button>
      </div>
    </header>
  );
}

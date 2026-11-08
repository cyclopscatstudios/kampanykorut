import "../newspaper/newspaper.css";
import classNames from "classnames";
import { t } from "i18next";
import { CampaignIntro } from "@/shared/types";
import { Button } from "../../../../../../shared/ui/Button";

export function CampaignIntroDialog({
  intro,
  fallbackTitle,
  open,
  onConfirm,
}: {
  intro?: CampaignIntro;
  fallbackTitle: string;
  open: boolean;
  onConfirm: () => void;
}) {
  if (!open || !intro) {
    return null;
  }

  const paragraphs = intro.text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // A clear layer instead of a backdrop: the map stays visible, but the
  // game waits until the player has read the intro.
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6"
      data-testid="campaignIntroDialog"
    >
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaignIntroTitle"
        className={classNames(
          "flex max-h-full w-full max-w-[560px] flex-col gap-3 overflow-y-auto rounded-[3px] px-4 pb-4 pt-4 shadow-[0_18px_40px_rgba(0,0,0,0.6)] md:rotate-[0.5deg] md:px-7 md:pb-5 md:pt-5",
          "bg-[radial-gradient(ellipse_at_30%_20%,#f4ecd6_0%,#ebe0c2_60%,#ddd0ad_100%)]",
          "font-['Old_Standard_TT',Georgia,serif] text-[#1c1a17]",
        )}
      >
        <div className="flex items-center justify-center gap-2.5 font-[Montserrat,sans-serif] text-[10px] font-bold uppercase tracking-[0.16em] text-[#3a352c]">
          <span aria-hidden="true" className="h-px w-7 bg-[#3a352c]" />
          {t("campaignIntro.label")}
          <span aria-hidden="true" className="h-px w-7 bg-[#3a352c]" />
        </div>

        <h2
          id="campaignIntroTitle"
          className="m-0 text-center font-['Playfair_Display',Georgia,serif] text-[40px] font-black italic leading-[0.95] tracking-[-0.02em] md:text-[56px]"
        >
          {intro.title ?? fallbackTitle}
        </h2>

        {intro.subtitle && (
          <div className="border-y-2 border-[#1c1a17] px-0.5 py-1 text-center text-[11px] font-bold md:text-xs">
            {intro.subtitle}
          </div>
        )}

        <div className="flex flex-col gap-2.5 text-[15px] leading-[1.45] md:text-base">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="m-0">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-1 flex justify-center border-t border-[#1c1a17]/35 pt-3 font-[Montserrat,sans-serif]">
          <Button
            onClick={onConfirm}
            className="w-full md:w-auto md:min-w-[220px]"
            testId="campaignIntroConfirm"
          >
            <Button.Text>{t("campaignIntro.confirm")}</Button.Text>
          </Button>
        </div>
      </article>
    </div>
  );
}

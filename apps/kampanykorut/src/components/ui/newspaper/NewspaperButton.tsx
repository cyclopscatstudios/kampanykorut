import "./newspaper.css";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { Button } from "../../../../../../shared/ui/Button";
import { Tooltip } from "../../../../../../shared/ui/Tooltip";

const RIBBON_MS = 3500;

// The map's corner entry to the newspaper. A dot marks an unread edition;
// `ribbon` slides out a short "extra edition" strip with the headline, for
// players who no longer get editions opened for them.
export function NewspaperButton({
  hasUnread,
  ribbon,
  onOpen,
}: {
  hasUnread: boolean;
  ribbon?: string;
  onOpen: () => void;
}) {
  const [hiddenRibbon, setHiddenRibbon] = useState<string | undefined>();
  const showRibbon = Boolean(ribbon) && ribbon !== hiddenRibbon;

  useEffect(() => {
    if (!ribbon) return;
    const timer = setTimeout(() => setHiddenRibbon(ribbon), RIBBON_MS);
    return () => clearTimeout(timer);
  }, [ribbon]);

  const label = hasUnread
    ? t("newspaper.entry.withNews")
    : t("newspaper.entry.label");

  return (
    <div className="relative flex items-center">
      <Tooltip content={label} position="bottom">
        <div className="relative z-30">
          <Button
            variant="hero"
            iconOnly
            aria-label={label}
            onClick={onOpen}
            testId="newspaperButton"
            className="border border-blue-50/20"
          >
            <Button.Icon name="newspaper" size="medium" />
          </Button>
          {hasUnread && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-amber-500 shadow-[0_0_0_2px_#0f172a]"
            />
          )}
        </div>
      </Tooltip>
      {showRibbon && (
        <div className="absolute inset-y-0 left-full z-20 flex items-center">
          <button
            type="button"
            onClick={onOpen}
            className="-ml-1.5 flex w-max max-w-[260px] cursor-pointer flex-col items-start gap-px rounded-r-md bg-[#efe6cf] py-1.5 pl-4 pr-3 text-left text-[#1c1a17] shadow-[0_6px_16px_rgba(0,0,0,0.35)] animate-[newspaper-ribbon_300ms_ease-out]"
            data-testid="newspaperRibbon"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a2a1b]">
              {t("newspaper.ribbon")}
            </span>
            <span className="line-clamp-2 font-['Alfa_Slab_One',Georgia,serif] text-sm leading-tight">
              {ribbon}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

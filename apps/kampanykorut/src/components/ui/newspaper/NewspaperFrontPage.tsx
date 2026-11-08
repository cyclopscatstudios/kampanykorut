import "./newspaper.css";
import classNames from "classnames";
import { t } from "i18next";
import type { ReactNode } from "react";
import { NewspaperEditionView } from "@/shared/types";

const MASTHEAD = "font-['Playfair_Display',Georgia,serif] italic font-black";
const HEADLINE = "font-['Alfa_Slab_One',Georgia,serif] uppercase";
const BODY = "font-['Old_Standard_TT',Georgia,serif]";
const INK = "text-[#1c1a17]";
const SOFT_INK = "text-[#3a352c]";

// The paper itself: masthead, date line, headline, photo and lead. Chrome
// around it (buttons, paging) comes in through `footer`.
export function NewspaperFrontPage({
  edition,
  year,
  footer,
}: {
  edition: NewspaperEditionView;
  year?: string | number;
  footer?: ReactNode;
}) {
  const { item, paper, issue, turn } = edition;

  return (
    <article
      className={classNames(
        "flex w-full flex-col gap-2.5 rounded-[3px] px-4 pb-3 pt-4 shadow-[0_30px_60px_rgba(0,0,0,0.55)] md:gap-3 md:px-8 md:pb-4 md:pt-6",
        "bg-[radial-gradient(ellipse_at_30%_20%,#f4ecd6_0%,#ebe0c2_60%,#ddd0ad_100%)]",
        BODY,
        INK,
      )}
      data-testid="newspaperFrontPage"
    >
      {paper.price && (
        <div
          className={classNames(
            "flex justify-end text-[9px] font-bold uppercase tracking-[0.12em] md:text-[11px]",
            SOFT_INK,
          )}
        >
          <span className="font-[Montserrat,sans-serif]">{paper.price}</span>
        </div>
      )}

      <div className="flex items-center justify-center gap-3 md:gap-5">
        {paper.logo && (
          <img
            src={paper.logo}
            alt=""
            className="size-11 shrink-0 object-contain md:size-[72px]"
          />
        )}
        <h2
          className={classNames(
            "m-0 text-center text-[34px] leading-[0.95] tracking-[-0.02em] md:text-[84px]",
            MASTHEAD,
          )}
        >
          {paper.name}
        </h2>
      </div>

      <div className="flex items-center justify-between gap-3 border-y-2 border-[#1c1a17] px-0.5 py-1 text-[11px] font-bold md:border-y-[3px] md:text-xs">
        <span>
          {year ? `${year} · ` : ""}
          {t("newspaper.turn", { turn })}
        </span>
        {paper.subtitle && (
          <span className="hidden uppercase tracking-[0.1em] md:inline">
            {paper.subtitle}
          </span>
        )}
        <span>{t("newspaper.issue", { issue })}</span>
      </div>

      <div
        className={classNames(
          "grid gap-3 pt-1 md:gap-6",
          item.image && "md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]",
        )}
      >
        <div className="flex flex-col gap-3">
          <h3
            className={classNames(
              "m-0 text-[28px] leading-[1.05] md:text-[42px]",
              HEADLINE,
            )}
          >
            {item.headline}
          </h3>
          <p className="m-0 text-base font-bold leading-snug md:text-lg">
            {item.lead}
          </p>
          <div
            aria-hidden="true"
            className="hidden min-h-16 flex-1 grid-cols-2 gap-3.5 opacity-30 md:grid"
          >
            <div className="bg-[repeating-linear-gradient(180deg,#1c1a17_0_2px,transparent_2px_9px)]" />
            <div className="bg-[repeating-linear-gradient(180deg,#1c1a17_0_2px,transparent_2px_9px)]" />
          </div>
        </div>
        {item.image && (
          <figure className="m-0 flex flex-col gap-1">
            <img
              src={item.image}
              alt=""
              className="max-h-[220px] w-full border-2 border-[#1c1a17] object-cover contrast-110 grayscale md:max-h-[320px]"
            />
            {item.imageCredit && (
              <figcaption className={classNames("text-xs italic", SOFT_INK)}>
                {item.imageCredit}
              </figcaption>
            )}
          </figure>
        )}
      </div>

      {footer && (
        <div className="mt-1 border-t border-[#1c1a17]/35 pt-2.5">{footer}</div>
      )}
    </article>
  );
}

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
        "flex w-full flex-col gap-2 rounded-[3px] px-4 pb-3 pt-3 shadow-[0_18px_40px_rgba(0,0,0,0.6)] md:gap-2.5 md:px-6 md:pb-4 md:pt-4",
        "bg-[radial-gradient(ellipse_at_30%_20%,#f4ecd6_0%,#ebe0c2_60%,#ddd0ad_100%)]",
        BODY,
        INK,
      )}
      data-testid="newspaperFrontPage"
    >
      {paper.price && (
        <div
          className={classNames(
            "flex justify-end font-[Montserrat,sans-serif] text-[9px] font-bold uppercase tracking-[0.12em] md:text-[10px]",
            SOFT_INK,
          )}
        >
          {paper.price}
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        {paper.logo && (
          <img
            src={paper.logo}
            alt=""
            className="size-10 shrink-0 object-contain md:size-12"
          />
        )}
        <h2
          className={classNames(
            "m-0 text-center text-[34px] leading-[0.95] tracking-[-0.02em] md:text-[50px]",
            MASTHEAD,
          )}
        >
          {paper.name}
        </h2>
      </div>

      <div className="flex items-center justify-between gap-3 border-y-2 border-[#1c1a17] px-0.5 py-1 text-[11px] font-bold">
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

      {item.image && (
        <figure className="m-0 flex flex-col gap-1 pt-1">
          <img
            src={item.image}
            alt=""
            className="max-h-[200px] w-full border-2 border-[#1c1a17] object-cover contrast-110 grayscale md:max-h-[240px]"
          />
          {item.imageCredit && (
            <figcaption className={classNames("text-[11px] italic", SOFT_INK)}>
              {item.imageCredit}
            </figcaption>
          )}
        </figure>
      )}

      <h3
        className={classNames(
          "m-0 pt-1 text-center text-2xl leading-[1.08] md:text-[28px]",
          HEADLINE,
        )}
      >
        {item.headline}
      </h3>
      <p className="m-0 text-[15px] font-bold leading-snug md:text-base">
        {item.lead}
      </p>

      {footer && (
        <div className="mt-1 border-t border-[#1c1a17]/35 pt-2.5 font-[Montserrat,sans-serif]">
          {footer}
        </div>
      )}
    </article>
  );
}

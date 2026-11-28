import "../newspaper/newspaper.css";
import {
  isCampaignListed,
  useGetCampaigns,
  useSettings,
} from "@logic/application";
import { track } from "@logic/infra/posthog/track";
import { Button } from "@shared/ui/Button";
import { Icon } from "@shared/ui/Icon";
import classNames from "classnames";
import { t } from "i18next";
import { type ReactNode, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../../../../brand-assets/svg/logo-horizontal-dark.svg";
import { useQuickStart } from "../../../hooks/useQuickStart";
import { campaignPagePath } from "../campaignPage/campaignPage.data";
import { useDocumentMeta } from "../campaignPage/useDocumentMeta";
import { CampaignChips } from "../menu/campaignSelector/CampaignChips";
import { sortCampaigns } from "../menu/campaignSelector/campaignSelector.utils";
import { LandingFooter } from "../menu/landing/LandingFooter";
import { LanguageSwitcher } from "../menu/landing/LanguageSwitcher";

export const ABOUT_PAGE_PATH = "/a-jatekrol";

const DISPLAY = "font-['Playfair_Display',Georgia,serif] font-black italic";

const list = (
  key:
    | "aboutPage.how.steps"
    | "aboutPage.night.features"
    | `aboutPage.modes.${"classic" | "strategic"}.features`,
) => t(key, { returnObjects: true }) as string[];

function Shot({
  src,
  alt,
  width,
  height,
  className,
  priority,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={classNames(
        "h-auto w-full rounded-md shadow-[0_18px_40px_-12px_rgba(0,0,0,0.75)] ring-1 ring-white/10",
        className,
      )}
    />
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2
      className={`${DISPLAY} text-[2rem] leading-[1.05] text-[#efe6cf] text-balance md:text-5xl`}
    >
      {children}
    </h2>
  );
}

function StartButtons({
  onChoose,
  onRandom,
  isStartingRandom,
}: {
  onChoose: () => void;
  onRandom: () => void;
  isStartingRandom: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Button size="lg" onClick={onChoose} testId="aboutChooseCampaign">
        <Button.Icon name="grid-fill" />
        <Button.Text>{t("landing.hero.chooseCampaign")}</Button.Text>
      </Button>
      <Button
        variant="hero"
        size="lg"
        onClick={onRandom}
        disabled={isStartingRandom}
        aria-busy={isStartingRandom}
        testId="aboutRandomStart"
      >
        <Button.Icon name="dice-5-fill" />
        <Button.Text>{t("landing.hero.randomStart")}</Button.Text>
      </Button>
    </div>
  );
}

function ModeColumn({
  mode,
  children,
}: {
  mode: "classic" | "strategic";
  children: ReactNode;
}) {
  const strategic = mode === "strategic";
  return (
    <article
      className={classNames(
        "flex flex-col gap-6 border-t-4 pt-6",
        strategic ? "border-purple-400" : "border-slate-400",
      )}
    >
      <header className="flex flex-col gap-2">
        <h3 className="flex items-center gap-2.5 text-2xl font-bold text-white">
          {strategic ? (
            <Icon name="bullseye" color="purple" />
          ) : (
            <Icon name={"classic" as never} source="svg" color="currentColor" />
          )}
          {t(`campaignSelector.mode.${mode}`)}
        </h3>
        <p className="max-w-prose text-slate-300">
          {t(`aboutPage.modes.${mode}.summary`)}
        </p>
      </header>
      {children}
      <ul className="flex flex-col gap-3">
        {list(`aboutPage.modes.${mode}.features`).map((feature) => (
          <li key={feature} className="flex gap-3 text-slate-200">
            <span
              aria-hidden
              className={classNames(
                "mt-2 size-1.5 shrink-0 rounded-full",
                strategic ? "bg-purple-300" : "bg-slate-300",
              )}
            />
            {feature}
          </li>
        ))}
      </ul>
      <p className="text-sm text-slate-400">
        {t(`aboutPage.modes.${mode}.where`)}
      </p>
    </article>
  );
}

export function AboutPage() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const allCampaigns = useGetCampaigns();
  const campaigns = sortCampaigns(
    allCampaigns.filter((campaign) => isCampaignListed(campaign)),
    "year",
  );
  const quickStart = useQuickStart(campaigns);
  const [isStartingRandom, setIsStartingRandom] = useState(false);

  const meta = useMemo(
    () => ({
      title: t("aboutPage.meta.title"),
      description: t("aboutPage.meta.description"),
      path: ABOUT_PAGE_PATH,
      image: "/about/classic-map.jpg",
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings.language],
  );
  useDocumentMeta(meta);

  const chooseCampaign = (placement: "hero" | "footer") => () => {
    track("about_start_clicked", { placement, target: "campaign_selector" });
    navigate("/new-game/classic");
  };

  const randomStart = (placement: "hero" | "footer") => () => {
    track("about_start_clicked", { placement, target: "random_start" });
    setIsStartingRandom(true);
    quickStart().finally(() => setIsStartingRandom(false));
  };

  const steps = list("aboutPage.how.steps");

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-[#0f172a] text-slate-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link to="/" aria-label={t("news.home")}>
            <img
              src={logo}
              alt="Kampánykörút"
              width={162}
              height={36}
              className="h-8 w-auto"
            />
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main>
        <section className="relative isolate">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_85%_30%,rgba(61,99,199,0.28),transparent_70%)]"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-10 pb-14 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-12 md:px-8 md:pt-16 md:pb-20">
            <div className="flex min-w-0 flex-col gap-6">
              <p className="text-sm font-semibold text-blue-300">
                {t("aboutPage.hero.kicker")}
              </p>
              <h1
                className={`${DISPLAY} text-[2.6rem] leading-none text-[#efe6cf] text-balance md:text-[4rem]`}
              >
                {t("aboutPage.hero.heading")}
              </h1>
              <p className="max-w-xl text-lg text-pretty text-blue-50">
                {t("aboutPage.hero.description")}
              </p>
              <StartButtons
                onChoose={chooseCampaign("hero")}
                onRandom={randomStart("hero")}
                isStartingRandom={isStartingRandom}
              />
              <p className="text-sm text-slate-400">
                {t("aboutPage.hero.facts")}
              </p>
            </div>
            <figure className="flex min-w-0 flex-col gap-3">
              <Shot
                src="/about/classic-map.jpg"
                alt={t("aboutPage.shots.classicMap")}
                width={1200}
                height={750}
                priority
              />
              <figcaption className="text-sm text-slate-400">
                {t("aboutPage.hero.caption")}
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#161e30]">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-14 md:px-8 md:py-20">
            <div className="flex flex-col gap-8">
              <SectionHeading>{t("aboutPage.how.heading")}</SectionHeading>
              <ol className="flex flex-col gap-6">
                {steps.map((step, index) => (
                  <li key={step} className="grid grid-cols-[2.5rem_1fr] gap-3">
                    <span
                      className={`${DISPLAY} text-3xl leading-none text-[#e0a23b]`}
                    >
                      {index + 1}.
                    </span>
                    <span className="text-pretty text-slate-200">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <figure className="flex flex-col gap-3 self-center">
              <Shot
                src="/about/classic-question.jpg"
                alt={t("aboutPage.shots.classicQuestion")}
                width={1200}
                height={750}
              />
              <figcaption className="text-sm text-slate-400">
                {t("aboutPage.how.caption")}
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <div className="mb-12 flex max-w-2xl flex-col gap-4">
            <SectionHeading>{t("aboutPage.modes.heading")}</SectionHeading>
            <p className="text-lg text-pretty text-slate-300">
              {t("aboutPage.modes.description")}
            </p>
          </div>
          <div className="grid gap-14 md:grid-cols-2 md:gap-10">
            <ModeColumn mode="classic">
              <Shot
                src="/about/mobile-question.jpg"
                alt={t("aboutPage.shots.mobileQuestion")}
                width={390}
                height={844}
                className="mx-auto max-w-60"
              />
            </ModeColumn>
            <ModeColumn mode="strategic">
              <Shot
                src="/about/strategic-focus.jpg"
                alt={t("aboutPage.shots.strategicFocus")}
                width={1200}
                height={750}
              />
              <div className="grid grid-cols-2 gap-3">
                <Shot
                  src="/about/strategic-issues.jpg"
                  alt={t("aboutPage.shots.strategicIssues")}
                  width={1200}
                  height={750}
                />
                <Shot
                  src="/about/coalition.jpg"
                  alt={t("aboutPage.shots.coalition")}
                  width={1000}
                  height={440}
                  className="self-center"
                />
              </div>
            </ModeColumn>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#161e30]">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
            <div className="mb-10 flex max-w-2xl flex-col gap-4">
              <SectionHeading>{t("aboutPage.night.heading")}</SectionHeading>
              <p className="text-lg text-pretty text-slate-300">
                {t("aboutPage.night.description")}
              </p>
            </div>
            <div className="grid gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
              <figure className="flex flex-col gap-3">
                <Shot
                  src="/about/results-summary.jpg"
                  alt={t("aboutPage.shots.results")}
                  width={1200}
                  height={750}
                />
                <figcaption className="text-sm text-slate-400">
                  {t("aboutPage.night.resultsCaption")}
                </figcaption>
              </figure>
              <div className="flex flex-col gap-6">
                <ul className="flex flex-col gap-3">
                  {list("aboutPage.night.features").map((feature) => (
                    <li key={feature} className="flex gap-3 text-slate-200">
                      <span
                        aria-hidden
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-[#e0a23b]"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <figure className="flex flex-col gap-3">
                  <Shot
                    src="/about/mayoral-summary.jpg"
                    alt={t("aboutPage.shots.mayoral")}
                    width={1200}
                    height={750}
                  />
                  <figcaption className="text-sm text-slate-400">
                    {t("aboutPage.night.mayoralCaption")}
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {campaigns.length > 0 && (
          <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
            <div className="mb-10 flex max-w-2xl flex-col gap-4">
              <SectionHeading>
                {t("aboutPage.campaigns.heading")}
              </SectionHeading>
              <p className="text-lg text-pretty text-slate-300">
                {t("aboutPage.campaigns.description")}
              </p>
            </div>
            <ol className="flex flex-col">
              {campaigns.map((campaign) => (
                <li
                  key={campaign.id}
                  className="grid gap-4 border-t border-white/10 py-6 md:grid-cols-[7rem_minmax(0,22rem)_minmax(0,1fr)] md:items-center md:gap-8"
                >
                  <span
                    className={`${DISPLAY} text-4xl leading-none text-[#e0a23b] md:text-5xl`}
                  >
                    {campaign.year}
                  </span>
                  <Link
                    to={campaignPagePath(campaign.id)}
                    className="block overflow-hidden rounded-md ring-1 ring-white/10 transition hover:ring-blue-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  >
                    <img
                      src={`/images/${campaign.route}/${campaign.thinCampaignBanner ?? campaign.campaignBanner}`}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="aspect-3/1 h-auto w-full object-cover"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-col gap-2">
                    <Link
                      to={campaignPagePath(campaign.id)}
                      className="text-xl font-bold text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                      {campaign.label}
                    </Link>
                    <CampaignChips campaign={campaign} />
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="relative isolate overflow-hidden border-t border-white/10">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-cover bg-position-[center_35%] opacity-30"
            style={{ backgroundImage: "url(/parlament_night.webp)" }}
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-linear-to-b from-[#0f172a] via-[#0f172a]/80 to-[#0f172a]"
          />
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-20 md:px-8 md:py-28">
            <SectionHeading>{t("aboutPage.cta.heading")}</SectionHeading>
            <p className="max-w-xl text-lg text-pretty text-blue-50">
              {t("aboutPage.cta.description")}
            </p>
            <StartButtons
              onChoose={chooseCampaign("footer")}
              onRandom={randomStart("footer")}
              isStartingRandom={isStartingRandom}
            />
            <p className="text-sm text-slate-400">
              {t("landing.hero.randomStartHint")}
            </p>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

import { Button } from "@shared/ui/Button";
import { Icon } from "@shared/ui/Icon";
import classNames from "classnames";
import { t } from "i18next";
import logo from "../../../../../../../brand-assets/svg/logo-horizontal-dark.svg";
import { LanguageSwitcher } from "./LanguageSwitcher";

const HERO_BACKGROUND = "/parlament_night.webp";
const MAP_PREVIEW = {
  src: "/landing/map-preview.webp",
  width: 1040,
  height: 650,
};

function revealWhenLoaded(img: HTMLImageElement | null) {
  if (!img || img.complete) return;
  img.dataset.loading = "";
  const reveal = () => delete img.dataset.loading;
  img.addEventListener("load", reveal, { once: true });
  img.addEventListener("error", reveal, { once: true });
}

export interface ContinueInfo {
  campaign: string;
  turn: number;
}

interface LandingHeroProps {
  onChooseCampaign: () => void;
  onRandomStart: () => void;
  onRandomIntent?: () => void;
  isStartingRandom?: boolean;
  onOpenMenu: () => void;
  continueInfo?: ContinueInfo;
  onContinue?: () => void;
}

export function LandingHero({
  onChooseCampaign,
  onRandomStart,
  onRandomIntent,
  isStartingRandom,
  onOpenMenu,
  continueInfo,
  onContinue,
}: LandingHeroProps) {
  return (
    <section
      className="relative px-4 pb-14"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.82) 55%, #0f172a 96%), url(${HERO_BACKGROUND})`,
        backgroundSize: "cover",
        backgroundPosition: "center 35%",
      }}
    >
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 py-5">
        <img
          src={logo}
          alt="Kampánykörút"
          width={162}
          height={36}
          className="h-9 w-auto md:h-10"
        />
        <nav className="flex items-center gap-4">
          <Button
            variant="link"
            onClick={onOpenMenu}
            testId="landingMenu"
            className="relative text-slate-200 after:absolute after:-inset-x-2 after:-inset-y-3 after:content-[''] hover:text-white"
          >
            <Button.Icon name="list" />
            <Button.Text>{t("landing.hero.menu")}</Button.Text>
          </Button>
          <LanguageSwitcher />
        </nav>
      </header>
      <div className="mx-auto grid max-w-6xl items-center gap-10 pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:pt-14">
        <div className="flex min-w-0 flex-col gap-6">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-balance text-white md:text-6xl">
            {t("landing.hero.heading")}
          </h1>
          <p className="max-w-xl text-lg text-pretty text-blue-50">
            {t("landing.hero.description")}
          </p>
          {continueInfo && onContinue && (
            <button
              type="button"
              onClick={onContinue}
              data-testid="landingContinue"
              className="flex items-center gap-3 self-stretch rounded-lg bg-slate-900/60 px-4 py-3 text-left ring-1 ring-slate-400/25 transition-colors hover:bg-slate-900/80 hover:ring-blue-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:self-start"
            >
              <Icon name="arrow-counterclockwise" color="currentColor" />
              <span className="flex min-w-0 flex-col">
                <span className="font-bold text-white">
                  {t("landing.hero.continue")}
                </span>
                <span className="truncate text-sm text-slate-300">
                  {t("landing.hero.continueDetail", { ...continueInfo })}
                </span>
              </span>
              <Icon
                name="arrow-right"
                color="currentColor"
                className="ml-auto text-slate-300"
              />
            </button>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              onClick={onChooseCampaign}
              testId="landingChooseCampaign"
            >
              <Button.Icon name="grid-fill" />
              <Button.Text>{t("landing.hero.chooseCampaign")}</Button.Text>
            </Button>
            <Button
              variant="hero"
              size="lg"
              onClick={onRandomStart}
              onPointerEnter={onRandomIntent}
              onFocus={onRandomIntent}
              onTouchStart={onRandomIntent}
              aria-busy={isStartingRandom}
              testId="landingRandomStart"
            >
              <span
                className={classNames(
                  "flex",
                  isStartingRandom && "motion-safe:animate-dice-roll",
                )}
              >
                <Button.Icon name="dice-5-fill" />
              </span>
              <Button.Text>{t("landing.hero.randomStart")}</Button.Text>
            </Button>
          </div>
          <p className="text-sm text-slate-300">
            {t("landing.hero.randomStartHint")}
          </p>
        </div>
        <figure className="flex min-w-0 flex-col gap-3">
          <img
            src={MAP_PREVIEW.src}
            width={MAP_PREVIEW.width}
            height={MAP_PREVIEW.height}
            alt={t("landing.hero.mapAlt")}
            fetchPriority="high"
            ref={revealWhenLoaded}
            className="h-auto w-full drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)] transition-[opacity,scale] duration-500 ease-out-strong data-loading:scale-[0.98] data-loading:opacity-0 motion-reduce:data-loading:scale-100"
          />
          <figcaption className="text-sm text-slate-300">
            {t("landing.hero.mapCaption")}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

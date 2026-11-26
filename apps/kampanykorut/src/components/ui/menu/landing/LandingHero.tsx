import { Button } from "@shared/ui/Button";
import { Icon } from "@shared/ui/Icon";
import { Tooltip } from "@shared/ui/Tooltip";
import { t } from "i18next";
import logo from "../../../../../../../brand-assets/svg/logo-horizontal-dark.svg";
import { LanguageSwitcher } from "./LanguageSwitcher";

const HERO_BACKGROUND = "/parlament_night.jpg";

const FEATURES = [
  {
    id: "decisions",
    icon: "chat-left-text-fill",
    tint: "bg-blue-400/15 text-blue-300",
  },
  {
    id: "polls",
    icon: "bar-chart-fill",
    tint: "bg-amber-400/15 text-amber-300",
  },
  {
    id: "electionNight",
    icon: "trophy-fill",
    tint: "bg-cyan-300/15 text-cyan-300",
  },
] as const;

interface LandingHeroProps {
  onQuickStart: () => void;
  onChooseCampaign: () => void;
}

export function LandingHero({
  onQuickStart,
  onChooseCampaign,
}: LandingHeroProps) {
  return (
    <section
      className="relative px-4 pb-14"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.82) 55%, #0f172a 100%), url(${HERO_BACKGROUND})`,
        backgroundSize: "cover",
        backgroundPosition: "center 35%",
      }}
    >
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 py-5">
        <img src={logo} alt="Kampánykörút" className="h-9 w-auto md:h-10" />
        <LanguageSwitcher />
      </header>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-10 pt-8 md:pt-14">
        <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-6">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-blue-400/10 px-3 py-1.5 text-sm font-semibold text-blue-50 ring-1 ring-blue-400/35">
            <Icon name="check-lg" size="sm" color="currentColor" />
            {t("landing.hero.kicker")}
          </span>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
            {t("landing.hero.heading")}
          </h1>
          <p className="max-w-xl text-lg text-blue-50">
            {t("landing.hero.description")}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={onQuickStart} testId="landingQuickStart">
              <Button.Icon name="play-circle-fill" />
              <Button.Text>{t("landing.hero.quickStart")}</Button.Text>
            </Button>
            <Button
              variant="hero"
              size="lg"
              onClick={onChooseCampaign}
              testId="landingChooseCampaign"
            >
              <Button.Icon name="grid-fill" />
              <Button.Text>{t("landing.hero.chooseCampaign")}</Button.Text>
            </Button>
          </div>
          <p className="text-sm text-slate-400">
            {t("landing.hero.quickStartHint")}
          </p>
        </div>
        <ul className="flex min-w-0 flex-[1_1_380px] flex-col gap-3">
          {FEATURES.map((feature) => (
            <li key={feature.id}>
              <Tooltip
                block
                position="bottom"
                content={
                  <span className="block max-w-xs text-slate-900">
                    {t(`landing.features.${feature.id}.tooltip`)}
                  </span>
                }
              >
                <div className="flex items-center gap-4 rounded-xl bg-slate-900/60 px-4 py-3.5 ring-1 ring-slate-400/20 backdrop-blur-sm">
                  <span
                    className={`flex size-13 flex-none items-center justify-center rounded-xl ${feature.tint}`}
                  >
                    <Icon name={feature.icon} size={24} color="currentColor" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-lg font-bold text-white">
                      {t(`landing.features.${feature.id}.title`)}
                    </span>
                    <span className="text-sm text-slate-400">
                      {t(`landing.features.${feature.id}.caption`)}
                    </span>
                  </span>
                </div>
              </Tooltip>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

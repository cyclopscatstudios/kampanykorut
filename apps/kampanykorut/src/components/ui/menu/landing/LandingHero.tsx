import { t } from "i18next";
import logo from "../../../../../../../brand-assets/svg/logo-stacked-dark.svg";
import { Button } from "../../../../../../../shared/ui/Button";
import { Text } from "../../../../../../../shared/ui/Text";
import { Heading } from "../../Heading";
import { LanguageSwitcher } from "./LanguageSwitcher";

const HERO_BACKGROUND = "/parlament_night.jpg";

interface LandingHeroProps {
  onStart: () => void;
}

export function LandingHero({ onStart }: LandingHeroProps) {
  return (
    <section
      className="relative flex flex-col items-center gap-6 px-6 py-20 text-center"
      style={{
        backgroundImage: `linear-gradient(rgba(15,23,42,0.75), rgba(15,23,42,0.94)), url(${HERO_BACKGROUND})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <LanguageSwitcher className="absolute right-4 top-4" />
      <img src={logo} alt="Kampánykörút" className="h-auto w-56 md:w-72" />
      <Heading level={1} color="white" className="max-w-3xl">
        {t("landing.hero.heading")}
      </Heading>
      <Text as="p" color="lightBlue" size="lg" className="max-w-2xl">
        {t("landing.hero.description")}
      </Text>
      <Button size="lg" onClick={onStart}>
        <Button.Icon name="play-circle-fill" />
        <Button.Text>{t("landing.hero.startButton")}</Button.Text>
      </Button>
    </section>
  );
}

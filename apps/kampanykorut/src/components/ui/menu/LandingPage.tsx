import { useNavigate } from "react-router-dom";
import { useGetCampaigns } from "@/logic/application";
import { Button } from "../../../../../../shared/ui/Button";
import { Text } from "../../../../../../shared/ui/Text";
import logo from "../../../../../../brand-assets/svg/logo-stacked-dark.svg";
import { Heading } from "../Heading";

const HERO_BACKGROUND = "/parlament_night.jpg";
const CAMPAIGN_TEASER_LENGTH = 260;

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function LandingPage() {
  const navigate = useNavigate();
  const campaigns = useGetCampaigns().filter(
    (campaign) => campaign.isPublished,
  );

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-slate-100">
      <section
        className="relative flex flex-col items-center gap-6 px-6 py-20 text-center"
        style={{
          backgroundImage: `linear-gradient(rgba(15,23,42,0.75), rgba(15,23,42,0.94)), url(${HERO_BACKGROUND})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <img src={logo} alt="Kampánykörút" className="h-auto w-56 md:w-72" />
        <Heading level={1} color="white" className="max-w-3xl">
          Magyar választási kampányszimulátor
        </Heading>
        <Text as="p" color="lightBlue" size="lg" className="max-w-2xl">
          A Kampánykörút egy ingyenes politikai stratégiai játék, amelyben egy
          magyar országgyűlési választási kampányt irányíthatsz. Kampányolj
          választókerületenként, hozz politikai döntéseket, kövesd a
          közvélemény-kutatásokat, majd nézd meg, sikerül-e többséget
          szerezned az Országgyűlésben.
        </Text>
        <Button size="lg" onClick={() => navigate("/menu")}>
          <Button.Icon name="play-circle-fill" />
          <Button.Text>Játék indítása</Button.Text>
        </Button>
      </section>

      {campaigns.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-16">
          <Heading level={2} color="white" className="mb-8 text-center">
            Elérhető kampányok
          </Heading>
          <div className="grid gap-6 md:grid-cols-2">
            {campaigns.map((campaign) => (
              <article
                key={campaign.id}
                className="flex flex-col overflow-hidden rounded-md border border-blue-500/30 bg-[rgba(148,163,184,0.05)]"
              >
                <img
                  src={`/images/${campaign.route}/${campaign.campaignBanner}`}
                  alt={campaign.label}
                  className="h-48 w-full object-cover"
                />
                <div className="flex flex-col gap-2 p-5">
                  <Heading level={3} color="white">
                    {campaign.label}
                  </Heading>
                  <Text as="p" color="gray" size="sm">
                    {truncate(campaign.description, CAMPAIGN_TEASER_LENGTH)}
                  </Text>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-white/10 px-6 py-8 text-center">
        <Text color="gray" size="xs">
          Kampánykörút — ingyenes, böngészőben futó választási szimuláció.
        </Text>
      </footer>
    </div>
  );
}

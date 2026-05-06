import { useMemo } from "react";
import { type FinalResults } from "@/logic/domain";
import { ImageWrapper } from "../ImageWrapper";
import { ParliamentHemicycle, type Party } from "../ParliamentHemicyle";
import { Heading } from "../../Heading";
import { Text } from "../../Text";
import type { RawParty } from "../../../../logic/types/campaignEngine.types";
import type { Mandate } from "../../../../logic/domain/MandateCalculator.types";
import { container } from "tsyringe";
import { StateEngine, ConfigEngine } from "@/logic/application";

export function SummaryPage({ results }: { results: FinalResults }) {
  const campaignStateEngine = container.resolve(StateEngine);
  const configEngine = container.resolve(ConfigEngine);
  const campaignState = campaignStateEngine.getCampaignState();
  const currentConfig = configEngine.getCampaignConfig();

  const didPlayerWin =
    results.winnerParty?.party === campaignState?.playerSide?.partyId;
  const assets = didPlayerWin
    ? currentConfig?.endResults.playerSideVictory
    : currentConfig?.endResults.playerSideDefeat;

  const parties = useMemo(
    () =>
      buildPartiesFromResults(results, currentConfig?.electionConfig.parties),
    [results, currentConfig?.electionConfig.parties],
  );

  return (
    <>
      <div className="border-b border-slate-200/65 p-3">
        <Heading color="lightBlue" className="text-center mb-1">
          {assets?.title}
        </Heading>
        <Text color="gray" className="text-center text-sm">
          {assets?.subtitle}
        </Text>
      </div>
      <div className="pb-5">
        <div className="flex gap-6 px-6 pt-5">
          <div className="basis-1/2">
            <ImageWrapper
              src={assets?.imageUri ?? ""}
              type="final"
              className={`object-cover rounded-xl ${
                didPlayerWin ? "" : "grayscale"
              }`}
            />
          </div>
          <div className="basis-1/2">
            <Text color="gray" className="leading-relaxed">
              {assets?.description}
            </Text>
          </div>
        </div>
        <div className="w-full flex justify-center mt-4">
          <div className="w-[500px]">
            <div className="dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200/65 dark:border-slate-700">
              <ParliamentHemicycle
                width={450}
                height={150}
                rows={9}
                order="as-given"
                showLegend
                seatGap={2}
                parties={parties}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function buildPartiesFromResults(
  results: FinalResults,
  parties?: RawParty[],
): Party[] {
  return results.mandates.map((mandate: Mandate) => {
    const party = parties?.find((p) => p.id === mandate.party);
    return {
      color: party?.color ?? "#cccccc",
      id: party?.name ?? mandate.party,
      name: party?.name ?? mandate.party,
      seats: mandate.totalSeats,
    };
  });
}

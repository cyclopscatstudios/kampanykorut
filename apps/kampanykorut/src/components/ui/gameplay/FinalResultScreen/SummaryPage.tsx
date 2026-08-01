import { useMemo } from "react";
import { container } from "tsyringe";
import { ConfigEngine, StateEngine } from "@/logic/application";
import { FinalResults, Mandate, RawParty } from "@/shared/types";
import { Text } from "../../../../../../../shared/ui/Text";
import { Heading } from "../../Heading";
import { ImageWrapper } from "../ImageWrapper";
import { ParliamentHemicycle, type Party } from "../ParliamentHemicyle";

// TODO: this should come from the campaign config
const MIN_SEATS_TO_WIN = 100;

export function SummaryPage({ results }: { results: FinalResults }) {
  const campaignStateEngine = container.resolve(StateEngine);
  const configEngine = container.resolve(ConfigEngine);
  const campaignState = campaignStateEngine.getCampaignState();
  const currentConfig = configEngine.getCampaignConfig();

  const winner = results.mandates.reduce((max, current) =>
    current.totalSeats > max.totalSeats ? current : max,
  );

  const playerSideId = campaignState?.playerSide?.partyId;
  const playerCandidateId = campaignState?.playerSide?.candidateId;
  const sideEndResults =
    playerSideId && playerCandidateId
      ? currentConfig?.playableSides?.[playerSideId]?.[playerCandidateId]
          ?.endResults
      : undefined;

  const didPlayerWin =
    winner.party === playerSideId && winner.totalSeats >= MIN_SEATS_TO_WIN;
  const assets = didPlayerWin
    ? sideEndResults?.playerSideVictory
    : sideEndResults?.playerSideDefeat;

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

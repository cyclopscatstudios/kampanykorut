import { useMemo } from "react";
import { container } from "tsyringe";
import { StateHandler } from "../../../../logic/application/StateHandler";
import type { FinalResults } from "../../../../logic/domain/CampaignEngine";
import type { RawParty } from "../../../../logic/domain/MandateCalculator.types";
import { ImageWrapper } from "../ImageWrapper";
import { ParliamentHemicycle, type Party } from "../ParliamentHemicyle";
import { Heading } from "../../Heading";
import { Text } from "../../Text";

export function SummaryPage({ results }: { results: FinalResults }) {
  const stateHandler = useMemo(() => container.resolve(StateHandler), []);
  const currentConfig = stateHandler.get("currentConfig");

  const didPlayerWin =
    results.winnerParty === currentConfig?.electionConfig.playerSide;
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
        <Heading color="lightBlue" className="text-center mb-2">
          {assets?.title}
        </Heading>
        <Text color="gray" className="text-center">
          {assets?.subtitle}
        </Text>
      </div>
      <div className="flex pb-5">
        <div className="pr-5">
          <div className="py-5">
            <ImageWrapper
              src={assets?.imageUri ?? ""}
              type="final"
              className={`rounded-xl ${didPlayerWin ? "" : "grayscale"}`}
            />
          </div>
          <div className="dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200/65 dark:border-slate-700">
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
        <div className="p-5">
          <Text color="gray">{assets?.description}</Text>
        </div>
      </div>
    </>
  );
}
// TODO: fix this later
function buildPartiesFromResults(results: any, parties?: RawParty[]): Party[] {
  return results.mandates.mandates.map((mandate: any) => {
    const party = parties?.find((p) => p.id === mandate.party);
    return {
      color: party?.color ?? "#cccccc",
      id: party?.name ?? mandate.party,
      name: party?.name ?? mandate.party,
      seats: mandate.totalSeats,
    };
  });
}

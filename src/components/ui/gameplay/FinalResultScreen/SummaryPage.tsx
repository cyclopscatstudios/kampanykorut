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
    results.winnerParty?.party === currentConfig?.electionConfig.playerSide;
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

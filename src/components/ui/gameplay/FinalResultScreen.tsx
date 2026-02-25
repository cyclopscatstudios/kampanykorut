import { useMemo } from "react";
import type { FinalResults } from "../../../logic/domain/CampaignEngine";
import { Text } from "../Text";
import { ParliamentHemicycle, type Party } from "./ParliamentHemicyle";
import { getPartyColor } from "../color.utils";
import type { PartyName } from "../../../types/color";
import { ImageWrapper } from "./ImageWrapper";
import { container } from "tsyringe";
import { StateHandler } from "../../../logic/application/StateHandler";

export function FinalResultScreen({ results }: { results: FinalResults }) {
  const parties = useMemo(() => buildPartiesFromResults(results), [results]);
  const stateHandler = container.resolve(StateHandler);
  const currentConfig = stateHandler.get("currentConfig");

  return (
    <div className="h-full bg-blue-950">
      <Text>Final Results</Text>
      <ImageWrapper
        src={currentConfig?.finalResultAssets.playerSideDefeat ?? ""}
        type="slogan"
      />
      <ParliamentHemicycle
        width={760}
        height={420}
        rows={9}
        order="as-given"
        ariaLabel="Parlamenti patkó – pártok szerint"
        showLegend
        seatGap={2}
        parties={[...parties]}
      />
    </div>
  );
}

function buildPartiesFromResults(results: FinalResults): Party[] {
  return results.mandates.map((party) => ({
    id: party.party,
    name: party.party,
    seats: party.totalSeats,
    color: getPartyColor(party.party as PartyName),
  }));
}

import { t } from "i18next";
import { container } from "tsyringe";
import { useMediaQuery } from "usehooks-ts";
import { StateEngine } from "@/logic/application";
import { CampaignConfig, MayoralResult } from "@/shared/types";
import { Text } from "../../../../../../../shared/ui/Text";
import { Heading } from "../../Heading";
import { ImageWrapper } from "../ImageWrapper";
import {
  formatShare,
  formatVotes,
  getMayoralHeadline,
  getWithdrawnCandidates,
} from "./mayoralResult.utils";

export function MayoralSummaryPage({
  mayoralResult,
  config,
}: {
  mayoralResult: MayoralResult;
  config: CampaignConfig;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const state = container.resolve(StateEngine).getCampaignState();
  const parties = config.electionConfig.parties;
  const partyById = (id: string) => parties.find((p) => p.id === id);

  const playerSideId = state?.playerSide?.partyId;
  const playerCandidateId = state?.playerSide?.candidateId;
  const endResults =
    playerSideId && playerCandidateId
      ? config.playableSides?.[playerSideId]?.[playerCandidateId]?.endResults
      : undefined;

  const { outcome, standings, margin } = mayoralResult;
  const headline = getMayoralHeadline(outcome, playerCandidateId);
  const asset =
    headline === "victory"
      ? endResults?.playerSideVictory
      : headline === "defeat"
        ? endResults?.playerSideDefeat
        : endResults?.deadlock;

  const fallbackTitle =
    outcome.kind === "winner"
      ? t("endResult.mayoral.winnerTitle", {
          name: partyById(outcome.candidateId)?.name ?? outcome.candidateId,
        })
      : outcome.kind === "tie"
        ? t("endResult.mayoral.tieTitle")
        : t("endResult.mayoral.noWinnerTitle");

  const withdrawn = getWithdrawnCandidates(state, parties);
  const topShare = standings[0]?.share ?? 0;

  return (
    <>
      <div className="border-b border-slate-200/65 p-3">
        <Heading color="lightBlue" className="text-center mb-1">
          {asset?.title ?? fallbackTitle}
        </Heading>
        <Text color="gray" className="text-center text-sm">
          {asset?.subtitle ?? t("endResult.mayoral.subtitle")}
        </Text>
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 px-3 md:px-6 pt-5 pb-5">
        {asset && (
          <div className="basis-full md:basis-1/2 flex flex-col gap-3">
            {asset.imageUri && (
              <ImageWrapper
                src={asset.imageUri}
                type="final"
                className={`object-cover rounded-xl ${
                  headline === "victory" ? "" : "grayscale"
                }`}
              />
            )}
            <Text color="gray" className="leading-relaxed">
              {asset.description}
            </Text>
          </div>
        )}
        <div
          className={`basis-full ${asset ? "md:basis-1/2" : ""} flex flex-col gap-3`}
          data-testid="mayoralStandings"
        >
          {standings.map((standing) => {
            const party = partyById(standing.candidateId);
            const isWinner =
              outcome.kind === "winner" &&
              outcome.candidateId === standing.candidateId;
            return (
              <div key={standing.candidateId} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: party?.color ?? "#8b8b8b" }}
                    />
                    <Text weight={isWinner ? "bold" : undefined}>
                      {party?.name ?? standing.candidateId}
                    </Text>
                  </div>
                  <Text weight="bold" className="shrink-0">
                    {formatShare(standing.share)}
                  </Text>
                </div>
                <div className="h-2 rounded-full bg-slate-700/60 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${topShare ? (standing.share / topShare) * 100 : 0}%`,
                      backgroundColor: party?.color ?? "#8b8b8b",
                    }}
                  />
                </div>
                <Text size="xs" color="gray">
                  {t("endResult.mayoral.votes", {
                    votes: formatVotes(standing.votes),
                  })}
                </Text>
              </div>
            );
          })}
          {margin && (
            <Text size={isDesktop ? undefined : "xs"}>
              {t("endResult.mayoral.margin", {
                votes: formatVotes(margin.votes),
                points: margin.percentagePoints.toFixed(2),
              })}
            </Text>
          )}
          {withdrawn.map((candidate) => (
            <Text key={candidate.id} size="xs" color="gray">
              {candidate.endorsedName
                ? t("endResult.mayoral.withdrawnEndorsed", {
                    name: candidate.name,
                    endorsed: candidate.endorsedName,
                  })
                : t("endResult.mayoral.withdrawn", { name: candidate.name })}
            </Text>
          ))}
          <Text size="xs" color="gray">
            {t("endResult.mayoral.validVotes", {
              votes: formatVotes(mayoralResult.validVotes),
            })}
          </Text>
        </div>
      </div>
    </>
  );
}

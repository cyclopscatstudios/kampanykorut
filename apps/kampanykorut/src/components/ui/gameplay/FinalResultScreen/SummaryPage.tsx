import { useMemo } from "react";
import { container } from "tsyringe";
import { useMediaQuery } from "usehooks-ts";
import { ConfigEngine, StateEngine } from "@/logic/application";
import {
  buildFinalOutcome,
  getMajorityStatus,
  getMajorityType,
  getParliamentaryConfig,
} from "@/shared/domain";
import { FinalResults, Mandate, RawParty } from "@/shared/types";
import { useTranslate } from "../../../../../../../shared/logic/hooks/useTranslateLang";
import { Text } from "../../../../../../../shared/ui/Text";
import { Heading } from "../../Heading";
import { ImageWrapper } from "../ImageWrapper";
import { ParliamentHemicycle, type Party } from "../ParliamentHemicyle";
import { GovernmentSummary } from "./GovernmentSummary";

export function SummaryPage({ results }: { results: FinalResults }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const campaignStateEngine = container.resolve(StateEngine);
  const configEngine = container.resolve(ConfigEngine);
  const campaignState = campaignStateEngine.getCampaignState();
  const currentConfig = configEngine.getCampaignConfig();

  const winner = results.mandates.reduce((max, current) =>
    current.totalSeats > max.totalSeats ? current : max,
  );

  const allSeats =
    getParliamentaryConfig(currentConfig?.electionConfig)?.allSeats ??
    results.mandates.reduce((sum, m) => sum + m.totalSeats, 0);
  const noWinner = getMajorityType(winner.totalSeats, allSeats) === null;

  const playerSideId = campaignState?.playerSide?.partyId;
  const playerCandidateId = campaignState?.playerSide?.candidateId;
  const sideEndResults =
    playerSideId && playerCandidateId
      ? currentConfig?.playableSides?.[playerSideId]?.[playerCandidateId]
          ?.endResults
      : undefined;

  const didPlayerWin = winner.party === playerSideId && !noWinner;
  const assets = didPlayerWin
    ? sideEndResults?.playerSideVictory
    : sideEndResults?.playerSideDefeat;

  const noWinnerAssets = sideEndResults?.deadlock;

  const finalOutcome = useMemo(
    () =>
      campaignState && currentConfig
        ? buildFinalOutcome(
            campaignState,
            currentConfig,
            campaignStateEngine.getHistory() ?? [],
          )
        : undefined,
    [campaignState, currentConfig, campaignStateEngine],
  );

  const heroAssets = noWinner ? noWinnerAssets : assets;
  // A strategic campaign leads with the government outcome, so the side's
  // story block is only shown when the campaign provides one.
  const showHero =
    !finalOutcome || Boolean(heroAssets?.imageUri || heroAssets?.description);

  const parties = useMemo(
    () =>
      buildPartiesFromResults(results, currentConfig?.electionConfig.parties),
    [results, currentConfig?.electionConfig.parties],
  );

  return (
    <>
      {(!finalOutcome || heroAssets?.title) && (
        <div className="border-b border-slate-200/65 p-3">
          <Heading color="lightBlue" className="text-center mb-1">
            {noWinner ? noWinnerAssets?.title : assets?.title}
          </Heading>
          <Text color="gray" className="text-center text-sm">
            {noWinner ? noWinnerAssets?.subtitle : assets?.subtitle}
          </Text>
        </div>
      )}
      <div className="pb-5">
        {finalOutcome && <GovernmentSummary outcome={finalOutcome} />}
        {showHero && (
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 px-3 md:px-6 pt-5">
            <div className="basis-full md:basis-1/2">
              <ImageWrapper
                src={
                  noWinner
                    ? (noWinnerAssets?.imageUri ?? "")
                    : (assets?.imageUri ?? "")
                }
                type="final"
                className={`object-cover rounded-xl ${
                  didPlayerWin ? "" : "grayscale"
                }`}
              />
            </div>
            <div className="basis-full md:basis-1/2">
              <Text color="gray" className="leading-relaxed">
                {noWinner ? noWinnerAssets?.description : assets?.description}
              </Text>
            </div>
          </div>
        )}
        {/* The government card already tells whether a majority formed. */}
        {results.regions && !finalOutcome && (
          <MajorityLabels
            results={results}
            allSeats={allSeats}
            parties={currentConfig?.electionConfig.parties}
          />
        )}
        <div className="w-full flex justify-center mt-4">
          <div className="w-full max-w-[500px] px-3 md:px-0">
            <div className="dark:bg-slate-800/50 p-2 md:p-5 rounded-xl border border-slate-200/65 dark:border-slate-700">
              <ParliamentHemicycle
                width={isDesktop ? 450 : 240}
                height={isDesktop ? 150 : 100}
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
  return results.mandates
    .filter(filterUnwantedParties)
    .map((mandate: Mandate) => {
      const party = parties?.find((p) => p.id === mandate.party);

      return {
        color: party?.color ?? "#cccccc",
        id: party?.name ?? mandate.party,
        name: party?.name ?? mandate.party,
        seats: mandate.totalSeats,
      };
    });
}

function filterUnwantedParties(mandate: Mandate): boolean {
  return !mandate.party.startsWith("_");
}

function MajorityLabels({
  results,
  allSeats,
  parties,
}: {
  results: FinalResults;
  allSeats: number;
  parties?: RawParty[];
}) {
  const t = useTranslate();
  const { leader, majority, missing } = getMajorityStatus(
    results.mandates,
    allSeats,
  );
  const leaderName =
    parties?.find((p) => p.id === leader?.party)?.name ?? leader?.party;

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-3 px-3">
      <div className="flex min-w-[220px] flex-col gap-1 rounded-xl bg-blue-400/8 px-4 py-3 text-center shadow-[inset_0_0_0_1px_rgba(239,246,255,0.12)]">
        <span className="text-xs font-bold uppercase tracking-[0.06em] text-blue-200">
          {t("endResult.majority.leader")}
        </span>
        <span className="text-lg font-bold text-slate-50">
          {leader ? `${leaderName} · ${leader.totalSeats}` : "–"}
        </span>
      </div>
      <div
        className={`flex min-w-[220px] flex-col gap-1 rounded-xl px-4 py-3 text-center ${
          missing === 0
            ? "bg-green-400/8 shadow-[inset_0_0_0_2px_#4ade80]"
            : "bg-amber-400/8 shadow-[inset_0_0_0_2px_#e0a23b]"
        }`}
      >
        <span className="text-xs font-bold uppercase tracking-[0.06em] text-blue-200">
          {t("endResult.majority.label", { majority })}
        </span>
        <span className="text-lg font-bold text-slate-50">
          {missing === 0
            ? t("endResult.majority.reached")
            : t("endResult.majority.missing", { missing })}
        </span>
      </div>
    </div>
  );
}

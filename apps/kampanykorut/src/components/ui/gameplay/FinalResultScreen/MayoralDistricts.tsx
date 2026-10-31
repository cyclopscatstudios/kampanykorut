import { t } from "i18next";
import {
  CampaignConfig,
  District,
  MayoralDistrictResult,
  MayoralResult,
} from "@/shared/types";
import { Text } from "../../../../../../../shared/ui/Text";
import { CommonWrapper } from "../../CommonWrapper";
import {
  formatShare,
  formatVotes,
  getMayoralDistrictRows,
} from "./mayoralResult.utils";

export function MayoralDistrictTable({
  mayoralResult,
  config,
}: {
  mayoralResult: MayoralResult;
  config: CampaignConfig;
}) {
  const parties = config.electionConfig.parties;
  const rows = getMayoralDistrictRows(mayoralResult.districts);

  return (
    <div
      className="h-full overflow-x-auto md:overflow-x-visible md:overflow-y-auto px-2"
      data-testid="mayoralDistricts"
    >
      <table className="w-full text-left text-xs md:text-sm text-slate-200">
        <thead className="sticky top-0 bg-[#0f172a] text-[10px] md:text-xs uppercase text-slate-400">
          <tr>
            <th className="py-2 pr-2">
              {t("endResult.mayoral.table.district")}
            </th>
            <th className="py-2 pr-2">{t("endResult.mayoral.table.leader")}</th>
            <th className="py-2 pr-2 text-right">
              {t("endResult.mayoral.table.share")}
            </th>
            <th className="py-2 pr-2 text-right">
              {t("endResult.mayoral.table.margin")}
            </th>
            <th className="py-2 text-right">
              {t("endResult.mayoral.table.validVotes")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const leader = parties.find((p) => p.id === row.leaderId);
            return (
              <tr
                key={`${row.megyekod}-${row.oevk}`}
                className="border-t border-slate-700/60"
              >
                <td className="py-1.5 pr-2 font-semibold">{row.label}</td>
                <td className="py-1.5 pr-2">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: leader?.color ?? "#8b8b8b" }}
                    />
                    {leader?.name ?? t("endResult.mayoral.tieTitle")}
                  </span>
                </td>
                <td className="py-1.5 pr-2 text-right">
                  {row.leaderShare === undefined
                    ? "–"
                    : formatShare(row.leaderShare)}
                </td>
                <td className="py-1.5 pr-2 text-right">
                  {row.marginPoints === undefined
                    ? "–"
                    : t("endResult.mayoral.table.points", {
                        points: row.marginPoints.toFixed(2),
                      })}
                </td>
                <td className="py-1.5 text-right">
                  {formatVotes(row.validVotes)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function MayoralDistrictPanel({
  district,
  mayoralResult,
  config,
}: {
  district: District | null;
  mayoralResult: MayoralResult;
  config: CampaignConfig;
}) {
  const result: MayoralDistrictResult | undefined = district
    ? mayoralResult.districts.find(
        (d) => d.megyekod === district.megyekod && d.oevk === district.oevk,
      )
    : undefined;
  const parties = config.electionConfig.parties;

  return (
    <CommonWrapper fullHeight={false} className="w-full md:w-auto min-w-0">
      <div className="w-full md:w-[400px] md:h-[444px] shrink-0 p-3 flex flex-col gap-2">
        <Text className="text-center" weight="bold">
          {result?.label ?? t("endResult.mayoral.selectDistrict")}
        </Text>
        {result?.standings.map((standing) => {
          const party = parties.find((p) => p.id === standing.candidateId);
          const isWinner =
            result.outcome.kind === "winner" &&
            result.outcome.candidateId === standing.candidateId;
          return (
            <div
              key={standing.candidateId}
              className="flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: party?.color ?? "#8b8b8b" }}
                />
                <Text size="sm" weight={isWinner ? "bold" : undefined}>
                  {party?.name ?? standing.candidateId}
                </Text>
              </span>
              <span className="text-right">
                <Text size="sm" weight="bold">
                  {formatShare(standing.share)}
                </Text>
                <Text size="xs" color="gray">
                  {formatVotes(standing.votes)}
                </Text>
              </span>
            </div>
          );
        })}
      </div>
    </CommonWrapper>
  );
}

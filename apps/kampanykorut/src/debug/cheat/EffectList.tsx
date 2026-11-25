import {
  type Answer,
  EffectType,
  type IconName,
  type RawEffect,
  type RawParty,
} from "@shared/types";
import { Icon } from "@shared/ui/Icon";
import { t } from "i18next";

interface EffectListProps {
  answer: Answer;
  parties: Pick<RawParty, "id" | "name">[];
}

export function EffectList({ answer, parties }: EffectListProps) {
  const partyName = (id: string) =>
    parties.find((party) => party.id === id)?.name ?? id;
  const conditional = answer.conditionalEffects ?? [];

  if (answer.effects.length === 0 && conditional.length === 0) {
    return (
      <span className="text-xs text-slate-500">{t("cheat.effect.none")}</span>
    );
  }

  return (
    <div className="flex max-w-[320px] flex-col gap-1 text-xs text-slate-800">
      {answer.effects.map((effect, index) => (
        <EffectLine key={index} effect={effect} partyName={partyName} />
      ))}
      {conditional.map((entry, index) => (
        <div key={index} className="border-l-2 border-amber-400 pl-2">
          <div className="font-mono text-[11px] text-amber-700">
            {t("cheat.effect.if")}{" "}
            {entry.if.map((c) => `${c.questionId}=${c.answerId}`).join(" & ")}
            {entry.mode === "replace" && ` · ${t("cheat.effect.replace")}`}
          </div>
          {entry.effects.map((effect, i) => (
            <EffectLine key={i} effect={effect} partyName={partyName} />
          ))}
        </div>
      ))}
    </div>
  );
}

function EffectLine({
  effect,
  partyName,
}: {
  effect: RawEffect;
  partyName: (id: string) => string;
}) {
  const shares = (values: Record<string, number>) =>
    Object.entries(values).map(([id, value]) => (
      <Delta key={id} label={partyName(id)} value={value} />
    ));

  switch (effect.type) {
    case EffectType.UniformSwing:
      return (
        <Row icon="graph-up-arrow" label={t("cheat.effect.swing")}>
          {shares(effect.params)}
        </Row>
      );
    case EffectType.TurnoutChange:
      return (
        <Row icon="people-fill" label={t("cheat.effect.turnout")}>
          {shares(effect.params)}
        </Row>
      );
    case EffectType.VoteAllocation:
      return (
        <Row
          icon="plus-circle-fill"
          label={`${t("cheat.effect.allocation")} ${effect.params.newVotes}`}
        >
          {shares(effect.params.share)}
        </Row>
      );
    case EffectType.DistrictVoteTransfer:
      return (
        <Row icon="geo-alt-fill" label={t("cheat.effect.transfer")}>
          {effect.params.map((target, index) => (
            <span key={index} className="font-mono">
              {"groupId" in target
                ? target.groupId
                : `${target.megyekod}/${target.oevk}`}
              → {partyName(target.targetParty)} {target.amount}
            </span>
          ))}
        </Row>
      );
    case EffectType.IssueStance:
      return (
        <Row icon="compass-fill" label={t("cheat.effect.stance")}>
          <span className="font-mono">{effect.params.issueId}</span>
          {effect.params.party && (
            <span>({partyName(effect.params.party)})</span>
          )}
          {effect.params.shift !== undefined && (
            <Delta value={effect.params.shift} />
          )}
          {effect.params.position !== undefined && (
            <span className="font-bold">= {effect.params.position}</span>
          )}
        </Row>
      );
  }
}

function Row({
  icon,
  label,
  children,
}: {
  icon: IconName;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
      <span className="flex items-center gap-1 font-semibold">
        <Icon name={icon} size="xs" color="currentColor" />
        {label}
      </span>
      {children}
    </div>
  );
}

function Delta({ label, value }: { label?: string; value: number }) {
  return (
    <span className={value >= 0 ? "text-emerald-700" : "text-rose-700"}>
      {label && `${label} `}
      <span className="font-bold">
        {value > 0 ? "+" : ""}
        {value}
      </span>
    </span>
  );
}

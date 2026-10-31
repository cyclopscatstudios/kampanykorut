import { injectable } from "tsyringe";
import { createLogger } from "../logger";
import {
  CampaignEvent,
  CampaignEventEffect,
  CampaignState,
  ElectionConfig,
  HistoryItem,
} from "../types";
import { getCampaignEventState } from "./CampaignStateAccess";
import { createConditionContext } from "./ConditionContext";
import { evaluateCondition } from "./ConditionEvaluator";

const log = createLogger("CampaignEventEngine");

export type ApplyEventEffects = (
  state: CampaignState,
  effects: CampaignEventEffect[],
) => CampaignState;

@injectable()
export class CampaignEventEngine {
  run(
    events: CampaignEvent[],
    state: CampaignState,
    answers: Pick<HistoryItem, "questionId" | "answerId">[],
    electionConfig: ElectionConfig,
    applyEffects: ApplyEventEffects,
  ): CampaignState {
    let current = state;

    for (const event of this.order(events)) {
      const { triggeredEventIds } = getCampaignEventState(current);
      const once = event.once ?? true;
      if (once && triggeredEventIds.includes(event.id)) {
        continue;
      }

      const context = createConditionContext(current, answers, electionConfig);
      const branch = event.conditions.find((b) =>
        evaluateCondition(b.if, context),
      );
      if (!branch) {
        continue;
      }

      log.info("Campaign event triggered", {
        eventId: event.id,
        turn: current.turn,
      });

      const applied = branch.effects.length
        ? applyEffects(current, branch.effects)
        : current;
      current = this.record(applied, event);
    }

    return current;
  }

  private order(events: CampaignEvent[]): CampaignEvent[] {
    return events
      .map((event, index) => ({ event, index }))
      .sort(
        (a, b) =>
          (b.event.priority ?? 0) - (a.event.priority ?? 0) ||
          a.index - b.index,
      )
      .map(({ event }) => event);
  }

  private record(state: CampaignState, event: CampaignEvent): CampaignState {
    const { triggeredEventIds, pendingAnnouncementIds } =
      getCampaignEventState(state);
    return {
      ...state,
      campaignEvents: {
        triggeredEventIds: triggeredEventIds.includes(event.id)
          ? triggeredEventIds
          : [...triggeredEventIds, event.id],
        pendingAnnouncementIds:
          event.announcement && !pendingAnnouncementIds.includes(event.id)
            ? [...pendingAnnouncementIds, event.id]
            : pendingAnnouncementIds,
      },
    };
  }
}

import classNames from "classnames";
import { t } from "i18next";
import type {
  FocusBranchView,
  FocusOverview,
  FocusView,
} from "@/shared/domain";
import { Button } from "../../../../../../shared/ui/Button";
import { HoverDetail } from "./DashboardTile";
import { FocusEmblem } from "./FocusEmblem";
import { focusStatusStyle } from "./focusStatusStyle";

export function FocusTab({
  overview,
  onSelect,
}: {
  overview: FocusOverview;
  onSelect: (focusId: string) => void;
}) {
  const single = overview.branches.length === 1 && !overview.branches[0].title;
  return (
    <section
      aria-label={t("politicalDashboard.tabs.focuses")}
      className="flex flex-col gap-8"
    >
      {overview.branches.map((branch, index) => (
        <BranchSection
          key={branch.id}
          branch={branch}
          heading={
            single
              ? undefined
              : (branch.title ??
                t("politicalDashboard.focus.branch", { index: index + 1 }))
          }
          onSelect={onSelect}
        />
      ))}
      <p className="m-0 text-center text-sm text-slate-400">
        {t("politicalDashboard.focus.finalNote")}
      </p>
    </section>
  );
}

function BranchSection({
  branch,
  heading,
  onSelect,
}: {
  branch: FocusBranchView;
  heading?: string;
  onSelect: (focusId: string) => void;
}) {
  const schedule =
    branch.state === "upcoming"
      ? t("politicalDashboard.focus.availableFrom", {
          turn: branch.availableFromTurn,
          article: getHungarianArticle(branch.availableFromTurn),
        })
      : branch.state === "open" && branch.requiredBeforeTurn
        ? t("politicalDashboard.focus.requiredBefore", {
            turn: branch.requiredBeforeTurn,
            article: capitalize(getHungarianArticle(branch.requiredBeforeTurn)),
          })
        : undefined;

  return (
    <section
      aria-label={heading}
      data-testid={`focusBranch-${branch.id}`}
      data-state={branch.state}
      className="flex flex-col gap-3"
    >
      {heading && (
        <h3 className="m-0 text-center text-base font-bold text-slate-200">
          {heading}
        </h3>
      )}
      {schedule && (
        <p
          className="m-0 text-center text-sm font-semibold text-amber-200"
          data-testid="focusSchedule"
        >
          {schedule}
        </p>
      )}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {branch.focuses.map((focus) => (
          <FocusCard key={focus.id} focus={focus} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}

function FocusCard({
  focus,
  onSelect,
}: {
  focus: FocusView;
  onSelect: (focusId: string) => void;
}) {
  const style = focusStatusStyle[focus.status];

  return (
    <div className="flex flex-col gap-3">
      <HoverDetail id={`focus-${focus.id}`} detail={focus.description}>
        <article
          aria-label={focus.title}
          className={classNames(
            "flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-xl p-6 text-center",
            style.card,
          )}
        >
          <FocusEmblem focus={focus} />
          <span className="text-xl font-bold text-slate-50">{focus.title}</span>
          <span className="text-sm text-slate-300">{focus.summary}</span>
          <span className={classNames("text-sm font-bold", style.word)}>
            {t(`politicalDashboard.focus.status.${focus.status}`)}
          </span>
        </article>
      </HoverDetail>
      {focus.selectable && (
        <Button
          variant="secondary"
          block
          onClick={() => onSelect(focus.id)}
          testId={`selectFocus-${focus.id}`}
        >
          <Button.Icon name="flag-fill" />
          <Button.Text>{t("politicalDashboard.focus.select")}</Button.Text>
        </Button>
      )}
    </div>
  );
}

// "a 2. kör" but "az 1. kör": the article follows the spoken number.
function getHungarianArticle(turn?: number) {
  const startsWithVowel =
    turn === 1 || turn === 5 || (turn !== undefined && turn >= 50 && turn < 60);
  return startsWithVowel ? "az" : "a";
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

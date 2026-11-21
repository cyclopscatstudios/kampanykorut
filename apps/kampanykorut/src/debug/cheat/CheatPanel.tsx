import { t } from "i18next";
import {
  type PointerEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";
import type { CampaignState, IconName } from "@/shared/types";
import { Button } from "../../../../../shared/ui/Button";
import { Icon } from "../../../../../shared/ui/Icon";
import { Tooltip } from "../../../../../shared/ui/Tooltip";
import { Switch } from "../../components/ui/Switch";
import {
  type CheatSettings,
  updateCheatSettings,
  useCheatSettings,
} from "./cheatStore";
import { getSideKey, useFollowedLine, useSideLines } from "./winningLines";

const PANEL_WIDTH = 272;

export function CheatPanel({ state }: { state?: CampaignState }) {
  const settings = useCheatSettings();
  if (!settings.enabled) {
    return null;
  }
  return <Panel settings={settings} state={state} />;
}

function Panel({
  settings,
  state,
}: {
  settings: CheatSettings;
  state?: CampaignState;
}) {
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const [dragged, setDragged] = useState<CheatSettings["position"] | null>(
    null,
  );
  const position = dragged ?? settings.position;
  const x = clamp(position.x, 0, window.innerWidth - 120);
  const y = clamp(position.y, 0, window.innerHeight - 48);

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    drag.current = { dx: event.clientX - x, dy: event.clientY - y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setDragged({
      x: event.clientX - drag.current.dx,
      y: event.clientY - drag.current.dy,
    });
  };
  const endDrag = () => {
    drag.current = null;
    if (dragged) {
      updateCheatSettings({ position: { x, y } });
      setDragged(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-label={t("cheat.title")}
      data-testid="cheatPanel"
      className="fixed z-[9000] overflow-hidden rounded-xl border border-amber-400/50 bg-slate-900/95 text-slate-100 shadow-2xl shadow-black/60 backdrop-blur"
      style={{
        left: x,
        top: y,
        width: settings.minimized ? undefined : PANEL_WIDTH,
      }}
    >
      <div
        className="flex cursor-grab touch-none select-none items-center gap-2 bg-amber-400/15 px-2 py-1 active:cursor-grabbing"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <Icon
          name="grip-vertical"
          size="sm"
          color="currentColor"
          className="text-amber-200/70"
        />
        <Icon name="magic" size="sm" color="yellow" />
        <span className="flex-1 text-sm font-bold text-amber-100">
          {t("cheat.title")}
        </span>
        <Button
          variant="tertiary"
          size="sm"
          iconOnly
          aria-label={t(settings.minimized ? "cheat.expand" : "cheat.minimize")}
          testId="cheatMinimize"
          onClick={() =>
            updateCheatSettings({ minimized: !settings.minimized })
          }
        >
          <Button.Icon
            name={settings.minimized ? "arrows-angle-expand" : "dash-lg"}
          />
        </Button>
        <Button
          variant="tertiary"
          size="sm"
          iconOnly
          aria-label={t("cheat.close")}
          testId="cheatClose"
          onClick={() => updateCheatSettings({ enabled: false })}
        >
          <Button.Icon name="x-lg" />
        </Button>
      </div>
      {!settings.minimized && <PanelBody settings={settings} state={state} />}
    </div>
  );
}

function PanelBody({
  settings,
  state,
}: {
  settings: CheatSettings;
  state?: CampaignState;
}) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <ToggleRow
        icon="hash"
        label={t("cheat.ids.label")}
        hint={t("cheat.ids.hint")}
        checked={settings.showIds}
        onChange={(showIds) => updateCheatSettings({ showIds })}
      />
      <ToggleRow
        icon="lightning-charge-fill"
        label={t("cheat.effects.label")}
        hint={t("cheat.effects.hint")}
        checked={settings.showEffects}
        onChange={(showEffects) => updateCheatSettings({ showEffects })}
      />
      <ToggleRow
        icon="signpost-split-fill"
        label={t("cheat.path.label")}
        hint={t("cheat.path.hint")}
        checked={settings.followPath}
        onChange={(followPath) => updateCheatSettings({ followPath })}
      />
      {settings.followPath && <PathPicker settings={settings} state={state} />}
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  hint,
  checked,
  onChange,
}: {
  icon: IconName;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <Tooltip content={hint} position="right" block>
      <div className="flex items-center gap-2">
        <Icon name={icon} size="sm" color={checked ? "yellow" : "lightBlue"} />
        <label htmlFor={id} className="flex-1 cursor-pointer text-sm">
          {label}
        </label>
        <Switch id={id} checked={checked} onChange={onChange} />
      </div>
    </Tooltip>
  );
}

function PathPicker({
  settings,
  state,
}: {
  settings: CheatSettings;
  state?: CampaignState;
}) {
  const lines = useSideLines(state);
  const line = useFollowedLine(state);
  const key = getSideKey(state);

  if (!key || lines.length === 0) {
    return (
      <p className="m-0 flex items-center gap-2 text-xs text-slate-400">
        <Icon name="slash-circle" size="xs" color="currentColor" />
        {t("cheat.path.none")}
      </p>
    );
  }

  const questionId = state?.currentQuestion?.id;
  const recommended = questionId ? line?.answers[questionId] : undefined;

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-slate-800/80 p-2">
      <select
        aria-label={t("cheat.path.pick")}
        data-testid="cheatPathSelect"
        className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-100"
        title={line?.name}
        value={settings.selectedLines[key] ?? ""}
        onChange={(event) =>
          updateCheatSettings({
            selectedLines: {
              ...settings.selectedLines,
              [key]: event.target.value,
            },
          })
        }
      >
        <option value="">{t("cheat.path.pick")}</option>
        {lines.map((entry) => (
          <option key={entry.name} value={entry.name}>
            {entry.name}
          </option>
        ))}
      </select>
      {line && (
        <>
          <Chips icon="flag-fill" items={line.focuses} />
          <Chips
            icon="people-fill"
            items={line.governments.map((gov) =>
              gov.partners.length > 0 ? gov.partners.join(" + ") : gov.outcome,
            )}
          />
          {recommended && (
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <Icon name="check-circle-fill" size="xs" color="currentColor" />
              {t("cheat.path.recommended")}
              <span className="rounded bg-emerald-500/20 px-1.5 font-mono font-bold">
                {recommended}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Chips({ icon, items }: { icon: IconName; items: ReactNode[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <Icon
        name={icon}
        size="xs"
        color="currentColor"
        className="text-emerald-300"
      />
      {items.map((item, index) => (
        <span
          key={index}
          className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] text-emerald-200"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

import type { BootstrapIcon, FocusStatus } from "@/shared/types";

interface FocusStatusStyle {
  card: string;
  emblem: string;
  word: string;
  badge?: { icon: BootstrapIcon; className: string };
}

// Each status differs in colour, icon, word and fill, so it never relies on
// colour alone.
export const focusStatusStyle: Record<FocusStatus, FocusStatusStyle> = {
  available: {
    card: "bg-blue-400/8 shadow-[inset_0_0_0_1px_rgba(239,246,255,0.12)]",
    emblem:
      "bg-blue-400/12 text-blue-300 shadow-[inset_0_0_0_2px_currentColor]",
    word: "text-slate-400",
  },
  selected: {
    card: "bg-blue-400/12 shadow-[inset_0_0_0_2px_#54a2ff]",
    emblem: "bg-blue-500/35 text-blue-50 shadow-[inset_0_0_0_3px_#54a2ff]",
    word: "text-blue-300",
    badge: { icon: "flag-fill", className: "bg-blue-400 text-slate-900" },
  },
  completed: {
    card: "bg-green-400/8 shadow-[inset_0_0_0_2px_#4ade80]",
    emblem: "bg-green-400/12 text-green-400 shadow-[inset_0_0_0_2px_#4ade80]",
    word: "text-green-300",
    badge: { icon: "check-lg", className: "bg-green-400 text-green-950" },
  },
  failed: {
    card: "bg-red-500/8 shadow-[inset_0_0_0_2px_#f87171]",
    emblem: "bg-red-500/16 text-red-200 shadow-[inset_0_0_0_2px_#f87171]",
    word: "text-red-200",
    badge: { icon: "x-lg", className: "bg-red-400 text-red-950" },
  },
  excluded: {
    card: "bg-transparent opacity-60 outline-2 outline-dashed -outline-offset-2 outline-slate-500",
    emblem:
      "bg-transparent text-slate-500 outline-2 outline-dashed outline-slate-500",
    word: "text-slate-400",
    badge: { icon: "lock-fill", className: "bg-slate-500 text-slate-900" },
  },
};

import { t } from "i18next";
import { useEffect, useState } from "react";
import { step1, step2, step3, step4, step5 } from "./icons";

type Step = {
  label: string;
  icon: React.ReactNode;
};

const steps: Step[] = [
  {
    label: t("voteCountingScreen.steps.pollingStations"),
    icon: step1,
  },
  {
    label: t("voteCountingScreen.steps.votesCollected"),
    icon: step2,
  },
  {
    label: t("voteCountingScreen.steps.votesCounted"),
    icon: step3,
  },
  {
    label: t("voteCountingScreen.steps.dataVerification"),
    icon: step4,
  },
  {
    label: t("voteCountingScreen.steps.resultsCompiled"),
    icon: step5,
  },
];

const STEP_THRESHOLDS = [0, 30, 60, 90, 100];

type VoteCountingScreenProps = {
  processedVotes?: number;
  totalVotes?: number;
  onComplete?: () => void;
};

export function VoteCountingScreen({
  processedVotes = 3286541,
  totalVotes = 5263035,
  onComplete,
}: VoteCountingScreenProps) {
  const [displayed, setDisplayed] = useState(0);

  const activeStep = STEP_THRESHOLDS.reduce(
    (acc, threshold, i) => (displayed >= threshold ? i : acc),
    0,
  );

  useEffect(() => {
    const duration = 2400;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setDisplayed(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1520] select-none">
      <div className="mb-4 text-gray-300">
        <svg
          viewBox="0 0 64 64"
          fill="currentColor"
          className="w-16 h-16 opacity-80"
        >
          <rect
            x="8"
            y="28"
            width="48"
            height="30"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M20 28V18a12 12 0 0 1 24 0v10"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M26 40l4 4 8-8"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="26"
            y="10"
            width="12"
            height="6"
            rx="1"
            fill="currentColor"
            opacity="0.5"
          />
        </svg>
      </div>
      <h1
        className="text-white font-black tracking-widest mb-2"
        style={{
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          textShadow: "0 2px 16px rgba(0,0,0,0.7)",
        }}
      >
        {t("voteCountingScreen.screen.voteCounting")}
      </h1>
      <p className="text-gray-300 text-lg mb-8 tracking-wide">
        {t("voteCountingScreen.screen.votesCounted")}
      </p>
      <div
        className="text-white font-bold mb-4 leading-none"
        style={{
          fontSize: "clamp(3rem, 8vw, 6rem)",
          textShadow: "0 2px 24px rgba(0,0,0,0.8)",
        }}
      >
        {displayed}%
      </div>
      <div className="w-[600px] max-w-[80vw] mb-3">
        <div className="w-full h-7 rounded-full bg-[#1e2d40] border border-[#3a4a5a] overflow-hidden relative">
          <div
            className="h-full rounded-full relative overflow-hidden"
            style={{
              width: `${displayed}%`,
              background: "linear-gradient(180deg, #f5c842 0%, #d4a017 100%)",
              transition: "width 0.5s ease",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(60deg, transparent, transparent 8px, rgba(255,255,255,0.15) 8px, rgba(255,255,255,0.15) 16px)",
              }}
            />
          </div>
        </div>
      </div>
      <p className="text-gray-300 text-base mb-10 tracking-wide">
        {t("voteCountingScreen.screen.processedVotes")}{" "}
        <span className="text-white font-semibold">{processedVotes}</span>
        {" / "}
        <span className="text-white font-semibold">{totalVotes}</span>
      </p>
      <div className="flex items-start justify-center gap-0 mb-10">
        {steps.map((step, i) => {
          const isActive = i === activeStep;
          const isDone = i < activeStep;
          return (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center w-28">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center border-2 mb-3"
                  style={{
                    borderColor: isActive
                      ? "#f5c842"
                      : isDone
                        ? "#f5c842"
                        : "#4a5a6a",
                    background: isActive
                      ? "rgba(245,200,66,0.12)"
                      : isDone
                        ? "rgba(245,200,66,0.08)"
                        : "rgba(30,45,64,0.7)",
                    color: isActive
                      ? "#f5c842"
                      : isDone
                        ? "#f5c842"
                        : "#6a7a8a",
                    boxShadow: isActive
                      ? "0 0 16px rgba(245,200,66,0.35)"
                      : "none",
                  }}
                >
                  {step.icon}
                </div>
                <p
                  className="text-center text-xs font-bold tracking-wider whitespace-pre-line leading-tight"
                  style={{ color: isActive ? "#f5c842" : "#8a9aaa" }}
                >
                  {step.label}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="mb-10 mx-1"
                  style={{
                    width: "48px",
                    height: "2px",
                    borderTop: "2px dashed",
                    borderColor: i < activeStep ? "#f5c842" : "#3a4a5a",
                    opacity: 0.7,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 text-gray-300">
        <svg
          className="animate-spin w-6 h-6 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span className="tracking-widest font-semibold text-sm uppercase">
          {t("voteCountingScreen.screen.pleaseWait")}
        </span>
      </div>
    </div>
  );
}

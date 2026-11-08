import type { SeatParty } from "@/shared/domain";
import { Tooltip } from "../../../../../../shared/ui/Tooltip";

export function SeatBar({
  parties,
  allSeats,
  majority,
  seats,
  label,
  hint,
}: {
  parties: (SeatParty & { pending?: boolean })[];
  allSeats: number;
  majority: number;
  seats: number;
  label: string;
  hint?: string;
}) {
  const reached = seats >= majority;
  const total = (
    <span
      data-testid="coalitionSeats"
      className={reached ? "text-green-300" : "text-amber-200"}
    >
      {seats} / {majority}
    </span>
  );

  return (
    <section
      aria-label={label}
      className="flex flex-col gap-3 rounded-xl bg-blue-400/8 p-4 shadow-[inset_0_0_0_1px_rgba(239,246,255,0.12)]"
    >
      <span className="flex items-baseline justify-between gap-3 text-xs font-bold uppercase tracking-[0.06em] text-blue-200">
        {label}
        <span className="text-xl font-extrabold normal-case tracking-normal">
          {hint ? (
            <Tooltip content={hint} position="left">
              {total}
            </Tooltip>
          ) : (
            total
          )}
        </span>
      </span>
      <span className="relative flex h-4 overflow-hidden rounded-full bg-slate-400/15">
        {parties.map((party) => (
          <span
            key={party.partyId}
            className="h-full transition-[width] duration-300"
            style={{
              width: `${(party.seats / allSeats) * 100}%`,
              backgroundColor: party.color,
              opacity: party.pending ? 0.55 : 1,
            }}
          />
        ))}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 w-0.5 bg-slate-50"
          style={{ left: `${(majority / allSeats) * 100}%` }}
        />
      </span>
    </section>
  );
}

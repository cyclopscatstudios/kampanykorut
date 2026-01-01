import { useEffect, useState } from "react";
import { Text } from "../components/ui/Text";
import { Button } from "../components/ui/Button";
import { MapWrapper } from "../components/ui/gameplay/MapWrapper";
import constituencyResults from "../assets/jsons/2022/oevk_constituency_results.json";
import listResults from "../assets/jsons/2022/oevk_list_results.json";
import oevk_2022 from "../assets/jsons/2022/oevk_2022.json";
import { ElectionEngine } from "../logic/ElectionEngine";
import {
  type ConstituencyDataProps,
  type PartyListDataProps,
} from "../logic/ResultModifier";

type Winner = "fidesz" | "ellenzeki_osszefogas";
type Shares = Record<string, number>;

export function Calculator() {
  const [constituencyState, setConstituencyState] =
    useState<ConstituencyDataProps[]>(constituencyResults);
  const [listState, setListState] = useState<PartyListDataProps[]>(listResults);
  const [mandates, setMandates] = useState<Record<Winner, number>>({
    fidesz: 0,
    ellenzeki_osszefogas: 0,
  });
  const [fideszShare, setFideszShare] = useState(0.54);
  const [ellenzekShare, setEllenzekShare] = useState(0.34);
  const engine = new ElectionEngine(constituencyResults, listResults, {
    listSeats: 93,
    thresholdPercent: 5,
  });
  const [_, setResults] = useState<{
    partyTotals: Record<string, number>;
    totalVotes: number;
  } | null>(null);

  const FIXED = {
    mi_hazank: 0.06,
    mkkp: 0.02,
    megoldas_mozgalom: 0.005,
    normalis_elet: 0.005,
  };

  useEffect(() => {
    resetResults();
  }, []);

  useEffect(() => {
    const result = sumPartyVotesWithTotal(listState);
    setResults(result);
  }, [listState]);

  const handleChangePartyPercentage = (value: number, party: string) => {
    const fixedNumbers = Object.values(FIXED).reduce((a, b) => a + b);
    const otherParty = party === "fidesz" ? ellenzekShare : fideszShare;
    if (fixedNumbers + otherParty + value > 1) {
      return;
    }
    if (party === "fidesz") {
      setFideszShare(value);
    } else {
      setEllenzekShare(value);
    }
  };

  function sumPartyVotesWithTotal(data: PartyListDataProps[]) {
    const partyTotals: Record<string, number> = {};
    let totalVotes = 0;

    for (const row of data) {
      for (const [party, votes] of Object.entries(row.partok)) {
        partyTotals[party] = (partyTotals[party] ?? 0) + (votes ?? 0);
        totalVotes += votes ?? 0;
      }
    }

    return {
      partyTotals,
      totalVotes,
    };
  }

  function normalizeTwoPartyShares(f: number, e: number): Shares {
    const sum = f + e;
    if (!sum) {
      return { fidesz: 0.5, ellenzeki_osszefogas: 0.5 };
    }

    return {
      fidesz: f / sum,
      ellenzeki_osszefogas: e / sum,
    };
  }

  function calculateNationalShareFromResults(
    data: ConstituencyDataProps[],
  ): Shares {
    let f = 0;
    let e = 0;

    for (const r of data) {
      f += r.partok.fidesz ?? 0;
      e += r.partok.ellenzeki_osszefogas ?? 0;
    }

    return normalizeTwoPartyShares(f, e);
  }

  function applyNationalSwing() {
    const baseShare = calculateNationalShareFromResults(constituencyResults);

    const targetShare = buildTargetShares(fideszShare, ellenzekShare);
    console.log({ baseShare }, { targetShare });

    const engine = new ElectionEngine(constituencyResults, listResults, {
      listSeats: 93,
      thresholdPercent: 5,
    });

    const { newDistricts, newList } = engine.modifyByTarget(
      baseShare,
      targetShare,
    );

    setConstituencyState(newDistricts);
    setListState(newList);
    const out = engine.calculate(newDistricts, newList);
    console.log({ out });

    setMandates({
      fidesz:
        out.mandates.find((m: any) => m.party === "fidesz")?.totalSeats ?? 0,
      ellenzeki_osszefogas:
        out.mandates.find((m: any) => m.party === "ellenzeki_osszefogas")
          ?.totalSeats ?? 0,
    });
  }

  function resetResults() {
    setConstituencyState(constituencyResults);
    setListState(listResults);
    setFideszShare(0.54);
    setEllenzekShare(0.34);

    const out = engine.calculate(listResults, constituencyResults);
    console.log({ out });

    setMandates({
      fidesz:
        out.mandates.find((m: any) => m.party === "fidesz")?.totalSeats ?? 0,
      ellenzeki_osszefogas:
        out.mandates.find((m: any) => m.party === "ellenzeki_osszefogas")
          ?.totalSeats ?? 0,
    });
  }

  function handleMoidyfyDistrict() {
    engine.modifyDistricts(listResults, 1, 1, "fidesz", 5000);
  }

  function handleModifyList() {
    const { updated } = engine.modifyByShare(listState, 200000, {
      fidesz: 0.46,
      ellenzeki_osszefogas: 0.51,
      mi_hazank: 0.03,
    });
    setListState(updated);
  }

  function buildTargetShares(
    fideszRatio: number,
    ellenzekRatio: number,
  ): Shares {
    const fixedSum =
      FIXED.mi_hazank +
      FIXED.mkkp +
      FIXED.megoldas_mozgalom +
      FIXED.normalis_elet;

    const remaining = 1 - fixedSum;
    const norm = fideszRatio + ellenzekRatio || 1;

    return {
      fidesz: (fideszRatio / norm) * remaining,
      ellenzeki_osszefogas: (ellenzekRatio / norm) * remaining,
      ...FIXED,
    };
  }

  function countConstituencySeats(results: ConstituencyDataProps[]) {
    let fidesz = 0;
    let ellenzek = 0;

    for (const r of results) {
      const f = r.partok.fidesz ?? 0;
      const e = r.partok.ellenzeki_osszefogas ?? 0;

      if (f > e) fidesz++;
      else if (e > f) ellenzek++;
    }

    return { fidesz, ellenzek };
  }

  const constituencySeats = countConstituencySeats(constituencyState);

  return (
    <div className="max-w-xl space-y-6 rounded-2xl bg-white/90 p-6 shadow-lg">
      <div className="flex flex-col gap-2 text-lg font-semibold">
        <div className="flex justify-between">
          <span className="text-red-600">
            Fidesz összesen: {mandates.fidesz}
          </span>
          <span className="text-blue-600">
            Ellenzék összesen: {mandates.ellenzeki_osszefogas}
          </span>
        </div>

        <div className="flex justify-between text-sm opacity-80">
          <span>– egyéni: {constituencySeats.fidesz}</span>
          <span>– egyéni: {constituencySeats.ellenzek}</span>
        </div>

        <div className="flex justify-between text-sm opacity-80">
          <span>– listás: {mandates.fidesz - constituencySeats.fidesz}</span>
          <span>
            – listás:{" "}
            {mandates.ellenzeki_osszefogas - constituencySeats.ellenzek}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Text className="text-sm font-medium">Fidesz %</Text>
          <input
            type="number"
            step="0.01"
            value={fideszShare}
            onChange={(e) =>
              handleChangePartyPercentage(+e.target.value, "fidesz")
            }
            className="w-full rounded border px-2 py-1"
          />
        </div>

        <div>
          <Text className="text-sm font-medium">Ellenzék %</Text>
          <input
            type="number"
            step="0.01"
            value={ellenzekShare}
            onChange={(e) =>
              handleChangePartyPercentage(+e.target.value, "ellenzek")
            }
            className="w-full rounded border px-2 py-1"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button onClick={applyNationalSwing}>
          <Button.Text>Apply swing</Button.Text>
        </Button>

        <Button variant="secondary" onClick={resetResults}>
          <Button.Text>Reset</Button.Text>
        </Button>

        <Button onClick={handleMoidyfyDistrict}>
          <Button.Text>Modify district</Button.Text>
        </Button>

        <Button onClick={handleModifyList}>
          <Button.Text>Modify list</Button.Text>
        </Button>
      </div>

      <MapWrapper districts={oevk_2022} fullView results={constituencyState} />
    </div>
  );
}

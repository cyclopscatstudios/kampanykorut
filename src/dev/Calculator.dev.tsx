import { useEffect, useRef, useState } from "react";
import { Text } from "../components/ui/Text";
import { Button } from "../components/ui/Button";
import { MapWrapper } from "../components/ui/gameplay/MapWrapper";

import constituencyResults from "../assets/jsons/2022/oevk_constituency_results.json";
import listResults from "../assets/jsons/2022/oevk_list_results.json";
import oevk_2022 from "../assets/jsons/2022/oevk_2022.json";

import { ElectionEngine } from "../logic/ElectionEngine";
import { ResultModifier, type OevkResult } from "../logic/ResultModifier";

type Winner = "fidesz" | "ellenzeki_osszefogas";
type Shares = Record<string, number>;

export function Calculator() {
  const [constituencyState, setConstituencyState] =
    useState<OevkResult[]>(constituencyResults);

  const [listState, setListState] = useState<OevkResult[]>(listResults);

  const [mandates, setMandates] = useState<Record<Winner, number>>({
    fidesz: 0,
    ellenzeki_osszefogas: 0,
  });

  const [fideszShare, setFideszShare] = useState(0.53);
  const [ellenzekShare, setEllenzekShare] = useState(0.35);

  const basesetConstituencyResultsRef =
    useRef<OevkResult[]>(constituencyResults);

  const resultModifierEngine = new ResultModifier(constituencyResults);

  useEffect(() => {
    resetResults();
  }, []);

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

  function calculateNationalShareFromResults(data: OevkResult[]): Shares {
    let f = 0;
    let e = 0;

    for (const r of data) {
      f += r.partok.fidesz ?? 0;
      e += r.partok.ellenzeki_osszefogas ?? 0;
    }

    return normalizeTwoPartyShares(f, e);
  }

  function applyNationalSwing() {
    const baseShare = calculateNationalShareFromResults(
      basesetConstituencyResultsRef.current,
    );

    const targetShare = buildTargetShares(fideszShare, ellenzekShare);

    const newDistricts = resultModifierEngine.applyNationalSwingToDistricts(
      basesetConstituencyResultsRef.current,
      baseShare,
      targetShare,
    );

    const newList = resultModifierEngine.applyNationalSwingToList(
      listState,
      baseShare,
      targetShare,
    );

    setConstituencyState(newDistricts);
    setListState(newList);

    const engine = new ElectionEngine(newDistricts, newList, {
      listSeats: 93,
      thresholdPercent: 5,
    });

    const out = engine.calculate();

    setMandates({
      fidesz:
        out.mandates.find((m: any) => m.party === "fidesz")?.totalSeats ?? 0,
      ellenzeki_osszefogas:
        out.mandates.find((m: any) => m.party === "ellenzeki_osszefogas")
          ?.totalSeats ?? 0,
    });
  }

  function resetResults() {
    setConstituencyState(basesetConstituencyResultsRef.current);
    setListState(listResults);

    const baseShares = deriveSharesFromList(listResults);

    setFideszShare(baseShares.fidesz);
    setEllenzekShare(baseShares.ellenzek);

    const engine = new ElectionEngine(
      basesetConstituencyResultsRef.current,
      listResults,
      {
        listSeats: 93,
        thresholdPercent: 5,
      },
    );

    const out = engine.calculate();

    setMandates({
      fidesz:
        out.mandates.find((m: any) => m.party === "fidesz")?.totalSeats ?? 0,
      ellenzeki_osszefogas:
        out.mandates.find((m: any) => m.party === "ellenzeki_osszefogas")
          ?.totalSeats ?? 0,
    });
  }

  function handleMoidyfyDistrict() {
    const result = resultModifierEngine.modifyDistrict(listResults, 1, 1, [
      { fidesz: 50000 },
    ]);
  }

  function buildTargetShares(
    fideszRatio: number,
    ellenzekRatio: number,
  ): Shares {
    const FIXED = {
      mi_hazank: 0.06,
      mkkp: 0.02,
      megoldas_mozgalom: 0.005,
      normalis_elet: 0.005,
    };

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

  function deriveSharesFromList(list: typeof listResults) {
    const totals: Record<string, number> = {};

    for (const row of list) {
      for (const [party, v] of Object.entries(row.partok)) {
        if (typeof v === "number") {
          totals[party] = (totals[party] ?? 0) + v;
        }
      }
    }

    const fixed = {
      mi_hazank: 0.06,
      mkkp: 0.02,
      megoldas_mozgalom: 0.005,
      normalis_elet: 0.005,
    };

    const fixedSum =
      fixed.mi_hazank +
      fixed.mkkp +
      fixed.megoldas_mozgalom +
      fixed.normalis_elet;

    const f = totals.fidesz ?? 0;
    const e = totals.ellenzeki_osszefogas ?? 0;

    const sumFE = f + e || 1;

    const round2 = (n: number) => Math.round(n * 100) / 100;

    return {
      fidesz: round2((f / sumFE) * (1 - fixedSum)),
      ellenzek: round2((e / sumFE) * (1 - fixedSum)),
    };
  }

  function countConstituencySeats(results: OevkResult[]) {
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
            onChange={(e) => setFideszShare(+e.target.value)}
            className="w-full rounded border px-2 py-1"
          />
        </div>

        <div>
          <Text className="text-sm font-medium">Ellenzék %</Text>
          <input
            type="number"
            step="0.01"
            value={ellenzekShare}
            onChange={(e) => setEllenzekShare(+e.target.value)}
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
      </div>

      <MapWrapper districts={oevk_2022} fullView results={constituencyState} />
    </div>
  );
}

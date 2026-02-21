import { useEffect, useState } from "react";
import { Text } from "../components/ui/Text";
import { Button } from "../components/ui/Button";
import { MapWrapper } from "../components/ui/gameplay/MapWrapper";
import candidateListResults from "../assets/jsons/2022/oevk_constituency_results.json";
import partyListResults from "../assets/jsons/2022/oevk_list_results.json";
import oevk_2022 from "../assets/jsons/2022/oevk_2022.json";
import { ElectionEngine } from "../logic/ElectionEngine";
import type {
  CandidateListData,
  PartyListData,
} from "../logic/domain/ResultTransformer/VoteShareTransformer.types";
import type { CalculateResults } from "../logic/domain/MandateCalculator.types";
import { StorageEngine } from "../logic/application/StorageEngine";

export function Calculator() {
  const [candidateListState, setCandidateListStat] =
    useState<CandidateListData[]>(candidateListResults);
  const [partyListState, setPartyListState] =
    useState<PartyListData[]>(partyListResults);
  const [mandates, setMandates] = useState<any>([]);
  const [fideszShare, setFideszShare] = useState(0.52);
  const [ellenzekShare, setEllenzekShare] = useState(0.36);
  const [miHazanShare, setMiHazankShare] = useState(0.6);
  const [otherShare, setOtherShare] = useState(0.5);

  console.log({ mandates });

  const engine = new ElectionEngine(
    {
      listSeats: 93,
      thresholdPercent: 5,
    },
    {
      maxTurnout: 85,
      eligibleVoters: 8215304,
      listData: candidateListState,
    },
  );

  const storage = new StorageEngine();

  const setResults = (calc: CalculateResults) => {
    const exclude = ["fidesz", "ellenzeki_osszefogas", "mi_hazank"];

    const other = Object.entries(calc.percentages)
      .filter(([key]) => !exclude.includes(key))
      .reduce((acc, [, value]) => acc + value, 0);
    setFideszShare(roundNumber(calc.percentages["fidesz"]));
    setEllenzekShare(roundNumber(calc.percentages["ellenzeki_osszefogas"]));
    setMiHazankShare(roundNumber(calc.percentages["mi_hazank"]));
    setOtherShare(roundNumber(other));
  };

  const getDefaultResults = () => {
    const calc = engine.calculate(candidateListResults, partyListResults);
    if (calc) {
      setResults(calc);
    }
    handleSetMandates(calc);
    saveBaseShare(candidateListResults, partyListResults);
  };

  const saveBaseShare = (c: CandidateListData[], p: PartyListData[]) => {
    const calc = engine.calculate(c, p);
    const baseShares = {
      ...calc?.percentages,
    };
    storage.setItem("devSession", JSON.stringify(baseShares), "localStorage");
  };

  useEffect(() => {
    getDefaultResults();
  }, []);

  const handleModifyBySwing = () => {
    const calc = engine.calculate(candidateListState, partyListState);
    const savedTotals = storage.getItem("devSession", "localStorage");
    const baseShares = toPercentages(JSON.parse(savedTotals ?? ""));
    const targetShares = getTargetShares(calc?.percentages);
    if (targetShares) {
      const results = engine.modifyByTarget(
        baseShares,
        targetShares,
        candidateListState,
        partyListState,
      );
      console.log({ baseShares, targetShares });
      setCandidateListStat(results.newCandidateData);
      setPartyListState(results.newPartyData);
      saveBaseShare(results.newCandidateData, results.newPartyData);
      const newCalc = engine.calculate(
        results.newCandidateData,
        results.newPartyData,
      );
      handleSetMandates(newCalc);
      console.log({ newCalc });
    }
  };

  function toPercentages(obj: Record<string, number>): Record<string, number> {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, v * 100]),
    );
  }

  const getTargetShares = (parties?: Record<string, number>) => {
    if (!parties) return null;

    const overrides: Record<string, number> = {
      fidesz: fideszShare,
      ellenzeki_osszefogas: ellenzekShare,
      mi_hazank: miHazanShare,
    };

    return Object.fromEntries(
      Object.entries(parties)
        .filter(([party]) => party in overrides)
        .map(([party]) => [party, overrides[party]]),
    );
  };

  const handlePercentageChange = (value: string, party: string) => {
    const newPercentage = Number(value);
    let remaining = 0;
    if (party === "fidesz") {
      remaining = ellenzekShare + miHazanShare + otherShare;
      console.log(remaining + newPercentage);
      if (newPercentage + remaining > 99) {
        return false;
      }
      setFideszShare(newPercentage);
    }
    if (party === "ellenzek") {
      remaining = fideszShare + miHazanShare + otherShare;
      if (newPercentage + remaining > 99) {
        return false;
      }
      setEllenzekShare(newPercentage);
    }
    if (party === "mi_hazank") {
      remaining = fideszShare + ellenzekShare + otherShare;
      if (newPercentage + remaining > 99) {
        return false;
      }
      setMiHazankShare(newPercentage);
    }
  };

  const handleSetMandates = (calc?: CalculateResults) => {
    setMandates(calc?.mandates);
  };

  const getMandates = (mandates: any, party: string) => {
    return mandates?.find((mandate: any) => mandate.party === party);
  };

  const roundNumber = (value: number) => {
    return Math.floor(value * 100);
  };

  return (
    <div className="rounded-2xl bg-white/90 p-6 shadow-lg">
      <div className="flex flex-col gap-2 text-lg font-semibold">
        <Text color="darkBlue">
          All share: {fideszShare + ellenzekShare + miHazanShare + otherShare}
        </Text>
        <Text>
          {fideszShare + ellenzekShare + miHazanShare + otherShare < 99 ||
          fideszShare + ellenzekShare + miHazanShare + otherShare < 100
            ? "❌"
            : "✅"}
        </Text>
        <div className="flex justify-between">
          <span className="text-orange-600">
            Fidesz összesen: {getMandates(mandates, "fidesz")?.totalSeats}
          </span>
          <span className="text-blue-600">
            Ellenzék összesen:{" "}
            {getMandates(mandates, "ellenzeki_osszefogas")?.totalSeats}
          </span>
          <span className="text-green-600">
            Mi Hazánk összesen: {getMandates(mandates, "mi_hazank")?.totalSeats}
          </span>
          <span className="text-red-600">Other összesen: 0</span>
        </div>

        <div className="flex justify-between text-sm opacity-80">
          <span>
            – egyéni: {getMandates(mandates, "fidesz")?.constituencySeats}
          </span>
          <span>
            – egyéni:{" "}
            {getMandates(mandates, "ellenzeki_osszefogas")?.constituencySeats}
          </span>
          <span>
            – egyéni: {getMandates(mandates, "mi_hazank")?.constituencySeats}
          </span>
          <span>– egyéni: 0</span>
        </div>

        <div className="flex justify-between text-sm opacity-80">
          <span>– listás: {getMandates(mandates, "fidesz")?.listSeats}</span>
          <span>
            – listás: {getMandates(mandates, "ellenzeki_osszefogas")?.listSeats}
          </span>
          <span>– listás: {getMandates(mandates, "mi_hazank")?.listSeats}</span>
          <span>– listás: 0</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Text className="text-sm font-medium">Fidesz %</Text>
          <input
            type="number"
            value={fideszShare}
            className="w-full rounded border px-2 py-1"
            onChange={(e) => handlePercentageChange(e.target.value, "fidesz")}
          />
        </div>
        <div>
          <Text className="text-sm font-medium">Ellenzék %</Text>
          <input
            type="number"
            value={ellenzekShare}
            className="w-full rounded border px-2 py-1"
            onChange={(e) => handlePercentageChange(e.target.value, "ellenzek")}
          />
        </div>
        <div>
          <Text className="text-sm font-medium">Mi Hazánk %</Text>
          <input
            type="number"
            value={miHazanShare}
            className="w-full rounded border px-2 py-1"
            onChange={(e) =>
              handlePercentageChange(e.target.value, "mi_hazank")
            }
          />
        </div>
        <div>
          <Text className="text-sm font-medium">Other %</Text>
          <input
            type="number"
            value={otherShare}
            className="w-full rounded border px-2 py-1"
            onChange={(e) => setOtherShare(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="secondary">
          <Button.Text>Reset</Button.Text>
        </Button>

        <Button onClick={handleModifyBySwing}>
          <Button.Text>Modify by swing</Button.Text>
        </Button>

        <Button>
          <Button.Text>Modify district</Button.Text>
        </Button>

        <Button>
          <Button.Text>Modify by share</Button.Text>
        </Button>

        <Button>
          <Button.Text>Modify list</Button.Text>
        </Button>

        <Button>
          <Button.Text>Modify by motivation</Button.Text>
        </Button>
      </div>
      <MapWrapper
        districts={oevk_2022}
        fullView
        results={candidateListState}
        handleDistrict={(d) => console.log(d)}
      />
    </div>
  );
}

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

interface ParyShares {
  fidesz: number;
  ellenzeki_osszefogas: number;
  mi_hazank: number;
  other: number;
}

interface GameState {
  candidateListData: CandidateListData[];
  partyListData: PartyListData[];
}

export function Calculator() {
  const [gameState, setGameState] = useState<GameState>({
    candidateListData: candidateListResults,
    partyListData: partyListResults,
  });
  const [partyShares, setPartyShares] = useState<ParyShares>({
    fidesz: 0.52,
    ellenzeki_osszefogas: 0.36,
    mi_hazank: 0.6,
    other: 0.5,
  });
  const [results, _] = useState<CalculateResults>();

  const engine = useElectionEngine(candidateListResults);
  const storage = new StorageEngine();

  const setResults = (results: CalculateResults) => {
    const exclude = ["fidesz", "ellenzeki_osszefogas", "mi_hazank"];
    const other = Object.entries(results.percentages)
      .filter(([key]) => !exclude.includes(key))
      .reduce((acc, [, value]) => acc + value, 0);
    setPartyShares({
      fidesz: roundNumber(results.percentages["fidesz"]),
      ellenzeki_osszefogas: roundNumber(
        results.percentages["ellenzeki_osszefogas"],
      ),
      mi_hazank: roundNumber(results.percentages["mi_hazank"]),
      other: roundNumber(other),
    });
  };

  const getDefaultResults = () => {
    const results = engine.calculate(
      gameState.candidateListData,
      gameState.partyListData,
    );
    if (results) {
      setResults(results);
    }
    handleSetMandates(results);
    saveBaseShare(gameState.candidateListData, gameState.partyListData);
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
    const calc = engine.calculate(
      gameState.candidateListData,
      gameState.partyListData,
    );
    const savedTotals = storage.getItem("devSession", "localStorage");
    const baseShares = toPercentages(JSON.parse(savedTotals ?? ""));
    const targetShares = getTargetShares(calc?.percentages);
    if (targetShares) {
      const results = engine.modifyByTarget(
        baseShares,
        targetShares,
        gameState.candidateListData,
        gameState.partyListData,
      );
      console.log({ baseShares, targetShares });
      setGameState({
        ...gameState,
        candidateListData: results.newCandidateData,
        partyListData: results.newPartyData,
      });
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
      fidesz: partyShares.fidesz,
      ellenzeki_osszefogas: partyShares.ellenzeki_osszefogas,
      mi_hazank: partyShares.mi_hazank,
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
      remaining =
        partyShares.ellenzeki_osszefogas +
        partyShares.mi_hazank +
        partyShares.other;
      console.log(remaining + newPercentage);
      if (newPercentage + remaining > 99) {
        return false;
      }
      setPartyShares({
        ...partyShares,
        fidesz: newPercentage,
      });
    }
    if (party === "ellenzek") {
      remaining =
        partyShares.fidesz + partyShares.mi_hazank + partyShares.other;
      if (newPercentage + remaining > 99) {
        return false;
      }
      setPartyShares({
        ...partyShares,
        ellenzeki_osszefogas: newPercentage,
      });
    }
    if (party === "mi_hazank") {
      remaining =
        partyShares.fidesz +
        partyShares.ellenzeki_osszefogas +
        partyShares.other;
      if (newPercentage + remaining > 99) {
        return false;
      }
      setPartyShares({
        ...partyShares,
        mi_hazank: newPercentage,
      });
    }
  };

  const handleSetMandates = (calc?: CalculateResults) => {
    if (!calc) return;
    setResults(calc);
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
          All share:{" "}
          {partyShares.fidesz +
            partyShares.ellenzeki_osszefogas +
            partyShares.mi_hazank +
            partyShares.other}
        </Text>
        <Text>
          {partyShares.fidesz +
            partyShares.ellenzeki_osszefogas +
            partyShares.mi_hazank +
            partyShares.other <
            99 ||
          partyShares.fidesz +
            partyShares.ellenzeki_osszefogas +
            partyShares.mi_hazank +
            partyShares.other >
            100
            ? "❌"
            : "✅"}
        </Text>
        <div className="flex justify-between">
          <span className="text-orange-600">
            Fidesz összesen: {getMandates(results, "fidesz")?.totalSeats}
          </span>
          <span className="text-blue-600">
            Ellenzék összesen:{" "}
            {getMandates(results, "ellenzeki_osszefogas")?.totalSeats}
          </span>
          <span className="text-green-600">
            Mi Hazánk összesen: {getMandates(results, "mi_hazank")?.totalSeats}
          </span>
          <span className="text-red-600">Other összesen: 0</span>
        </div>

        <div className="flex justify-between text-sm opacity-80">
          <span>
            – egyéni: {getMandates(results, "fidesz")?.constituencySeats}
          </span>
          <span>
            – egyéni:{" "}
            {getMandates(results, "ellenzeki_osszefogas")?.constituencySeats}
          </span>
          <span>
            – egyéni: {getMandates(results, "mi_hazank")?.constituencySeats}
          </span>
          <span>– egyéni: 0</span>
        </div>

        <div className="flex justify-between text-sm opacity-80">
          <span>– listás: {getMandates(results, "fidesz")?.listSeats}</span>
          <span>
            – listás: {getMandates(results, "ellenzeki_osszefogas")?.listSeats}
          </span>
          <span>– listás: {getMandates(results, "mi_hazank")?.listSeats}</span>
          <span>– listás: 0</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Text className="text-sm font-medium">Fidesz %</Text>
          <input
            type="number"
            value={partyShares.fidesz}
            className="w-full rounded border px-2 py-1"
            onChange={(e) => handlePercentageChange(e.target.value, "fidesz")}
          />
        </div>
        <div>
          <Text className="text-sm font-medium">Ellenzék %</Text>
          <input
            type="number"
            value={partyShares.ellenzeki_osszefogas}
            className="w-full rounded border px-2 py-1"
            onChange={(e) =>
              handlePercentageChange(e.target.value, "ellenzeki_osszefogas")
            }
          />
        </div>
        <div>
          <Text className="text-sm font-medium">Mi Hazánk %</Text>
          <input
            type="number"
            value={partyShares.mi_hazank}
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
            value={partyShares.other}
            className="w-full rounded border px-2 py-1"
            onChange={(e) => handlePercentageChange(e.target.value, "other")}
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
        results={gameState.candidateListData}
        handleDistrict={(d) => console.log(d)}
      />
    </div>
  );
}

function useElectionEngine(candidateListResults: CandidateListData[]) {
  const electionEngine = new ElectionEngine(
    {
      listSeats: 93,
      thresholdPercent: 5,
      parties: []
    },
    {
      maxTurnout: 85,
      eligibleVoters: 8215304,
      listData: candidateListResults,
    },
  );

  return electionEngine;
}

import { DistrictMap } from "./DistrictMap";
import oevk_2022 from "../assets/jsons/oevk_2022.json";
import results from "../assets/jsons/2022_results.json";

export function MapCreator() {
  return (
    <DistrictMap
      districts={oevk_2022}
      result={results}
      width={1000}
      height={600}
      stroke="#333"
      strokeWidth={1}
    />
  );
}

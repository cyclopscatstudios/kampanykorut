import { DistrictMap } from "./DistrictMap";
import hungary_oevk from "../assets/jsons/oevk.json";

export function MapCreator() {
  return (
    <DistrictMap
      districts={hungary_oevk}
      width={800}
      height={500}
      stroke="#333"
      strokeWidth={0.8}
    />
  );
}

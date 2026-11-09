import json
import sys
from pathlib import Path

from shapely.geometry import Polygon
from shapely.ops import unary_union

HERE = Path(__file__).parent
SHARED = HERE.parent.parent / "public/assets/jsons/shared"
SNAP = 0.002


def ring(poligon):
    return Polygon([tuple(map(float, p.split()))[::-1] for p in poligon.split(",")])


def main():
    oevk = json.loads((SHARED / "oevk_2011.json").read_text())
    by_county = {}
    for d in oevk:
        by_county.setdefault(int(d["maz"]), {})[int(d["evk"])] = ring(d["poligon"])

    districts = json.loads((HERE / "districts.json").read_text())
    used = set()
    out = []
    for district in districts:
        parts = []
        for county, evks in district["oevk2011"].items():
            county = int(county)
            ids = sorted(by_county[county]) if evks == "all" else evks
            for evk in ids:
                key = (county, evk)
                if key in used:
                    sys.exit(f"OEVK {key} is assigned twice")
                used.add(key)
                parts.append(by_county[county][evk])
        shape = unary_union([p.buffer(SNAP) for p in parts]).buffer(-SNAP)
        if shape.geom_type == "MultiPolygon":
            shape = max(shape.geoms, key=lambda g: g.area)
        if any(Polygon(i).area > 0.001 for i in shape.interiors):
            sys.exit(f"district {district['id']} surrounds another district")
        shape = Polygon(shape.exterior).simplify(0.0005)
        coords = list(shape.exterior.coords)
        center = shape.representative_point()
        out.append(
            {
                "maz": f"{district['id']:02d}",
                "evk": "01",
                "centrum": f"{center.y:.6f} {center.x:.6f}",
                "poligon": ",".join(f"{lat:.6f} {lon:.6f}" for lon, lat in coords),
            }
        )

    missing = {(int(d["maz"]), int(d["evk"])) for d in oevk} - used
    if missing:
        sys.exit(f"OEVKs without a 1945 district: {sorted(missing)}")

    target = SHARED / "valasztokerulet_1945.json"
    target.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
    print(f"wrote {len(out)} districts to {target}")


if __name__ == "__main__":
    main()

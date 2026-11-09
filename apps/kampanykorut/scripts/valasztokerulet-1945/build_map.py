import json
import sys
from pathlib import Path

from shapely.geometry import LineString, Polygon
from shapely.ops import nearest_points, unary_union
from svgelements import SVG, Close, Move
from svgelements import Path as SvgPath

HERE = Path(__file__).parent
SHARED = HERE.parent.parent / "public/assets/jsons/shared"

DISTRICTS = [
    (1, "Budapest", "path3816"),
    (2, "Pest-Pilis-Solt-Kiskun", "path5059"),
    (3, "Baranya és Tolna", "path3680"),
    (4, "Somogy", "path3842"),
    (5, "Zala", "path3888"),
    (6, "Vas", "path3796"),
    (7, "Győr-Moson-Pozsony és Sopron", "path3801"),
    (8, "Veszprém", "path3891"),
    (9, "Fejér és Komárom-Esztergom", "path3811"),
    (10, "Nógrád-Hont és Heves", "path4594"),
    (11, "Borsod, Abaúj és Zemplén", "path4814"),
    (12, "Szabolcs-Szatmár-Bereg", "path4696"),
    (13, "Hajdú és Bihar", "path4691"),
    (14, "Jász-Nagykun-Szolnok", "path4686"),
    (15, "Békés", "path4587"),
    (16, "Csongrád és Csanád", "path4589"),
]


def svg_rings(svg_file):
    wanted = {path_id for _, _, path_id in DISTRICTS}
    rings = {}
    for element in SVG.parse(svg_file).elements():
        if not isinstance(element, SvgPath) or element.id not in wanted:
            continue
        parts, current = [], []
        for segment in element.segments():
            if isinstance(segment, Move):
                if len(current) > 2:
                    parts.append(current)
                current = [(segment.end.x, segment.end.y)]
            elif isinstance(segment, Close):
                if len(current) > 2:
                    parts.append(current)
                current = []
            else:
                current += [
                    (p.x, p.y) for p in (segment.point(k / 4) for k in range(1, 5))
                ]
        if len(current) > 2:
            parts.append(current)
        rings[element.id] = parts
    return rings


def oevk_polygons():
    oevk = json.loads((SHARED / "oevk_2011.json").read_text())
    return {
        (int(d["maz"]), int(d["evk"])): Polygon(
            [tuple(map(float, p.split()))[::-1] for p in d["poligon"].split(",")]
        ).buffer(0)
        for d in oevk
    }


def without_holes(shape):
    for hole in shape.interiors:
        a, b = nearest_points(Polygon(hole).exterior, shape.exterior)
        slit = LineString([a, b]).buffer(0.0003)
        shape = shape.difference(slit)
    if shape.geom_type == "MultiPolygon":
        shape = max(shape.geoms, key=lambda g: g.area)
    return shape


def main(svg_file):
    rings = svg_rings(svg_file)
    oevk = oevk_polygons()
    country = unary_union([p.buffer(0.003) for p in oevk.values()]).buffer(-0.003)
    drawn = unary_union([Polygon(r[0]).buffer(0.5) for r in rings.values()]).buffer(-0.5)
    lon0, lat0, lon1, lat1 = country.bounds
    x0, y0, x1, y1 = drawn.bounds

    def to_geo(point):
        x, y = point
        return (
            lon0 + (x - x0) / (x1 - x0) * (lon1 - lon0),
            lat1 - (y - y0) / (y1 - y0) * (lat1 - lat0),
        )

    out, regions = [], {}
    for district_id, name, path_id in DISTRICTS:
        outer, *holes = rings[path_id]
        shape = Polygon(
            [to_geo(p) for p in outer], [[to_geo(p) for p in h] for h in holes]
        ).buffer(0)
        regions[district_id] = shape
        shape = without_holes(shape).simplify(0.002)
        center = regions[district_id].representative_point()
        out.append(
            {
                "maz": f"{district_id:02d}",
                "evk": "01",
                "centrum": f"{center.y:.6f} {center.x:.6f}",
                "poligon": ",".join(
                    f"{lat:.5f} {lon:.5f}" for lon, lat in shape.exterior.coords
                ),
            }
        )

    mapping = {district_id: {} for district_id, _, _ in DISTRICTS}
    for (county, evk), polygon in sorted(oevk.items()):
        best = max(regions, key=lambda d: regions[d].intersection(polygon).area)
        mapping[best].setdefault(str(county), []).append(evk)

    (SHARED / "valasztokerulet_1945.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2) + "\n"
    )
    (HERE / "districts.json").write_text(
        json.dumps(
            [
                {"id": district_id, "name": name, "oevk2011": mapping[district_id]}
                for district_id, name, _ in DISTRICTS
            ],
            ensure_ascii=False,
            indent=2,
        )
        + "\n"
    )
    print(f"wrote {len(out)} districts")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: build_map.py <1945 constituency map .svg>")
    main(sys.argv[1])

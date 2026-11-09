# 1945-ös választókerület-térkép

A `valasztokerulet_1945.json` az 1945-ös nemzetgyűlési választás 16 választókerületét rajzolja ki (`maz` 01–16, `evk` 01). A határok forrása a Wikimedia Commons „1945 Hungarian parliamentary election - Results by constituency.svg” térképe. A felhasználás és a forrásmegjelölés feltételei a fájl Commons-oldalán vannak.

A `build_map.py` az SVG-ből veszi át a kerületek körvonalát, és földrajzi koordinátákra vetíti őket a 2011-es OEVK-térkép országhatára alapján. Budapest a Pest-Pilis-Solt-Kiskun kerületen belül fekszik. Mivel a térképformátum nem kezel lyukat, a Pest-kerületben egy hajszálvékony rés köti össze a lyukat a külső határral.

A `districts.json` is a szkript kimenete: minden 2011-es OEVK abba a kerületbe kerül, amellyel a legnagyobb a közös területe. Ez a táblázat használható, ha a mai körzeti adatokat 1945-ös kerületekre akarjuk összesíteni.

```sh
pip install shapely svgelements
python3 apps/kampanykorut/scripts/valasztokerulet-1945/build_map.py <letöltött svg>
```

A configban: `"districtMap": "1945"`, a körzeti adatsorok `megyekod` 1–16, `oevk` 1, a régiók pedig `megyekods: [n]`.

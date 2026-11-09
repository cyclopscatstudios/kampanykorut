# 1945-ös mintájú választókerület-térkép

A `districts.json` sorolja fel a 16 választókerületet, és mindegyikhez megadja, mely 2011-es OEVK-k tartoznak hozzá (megyekód → OEVK-számok vagy `"all"`). A `build_map.py` ezeket a soksokszögeket vonja össze, és az eredményt a `public/assets/jsons/shared/valasztokerulet_1945.json` fájlba írja (`maz` = kerület 01–16, `evk` = 01).

```sh
pip install shapely
python3 apps/kampanykorut/scripts/valasztokerulet-1945/build_map.py
```

A határok a mai OEVK-vonalakat követik, ezért csak megközelítik az 1950 előtti vármegyéket. A kerületek listáját emlékezetből állítottuk össze; ha pontosabb forrás kerül elő, elég a `districts.json`-t átírni, és újra lefuttatni a szkriptet.

A configban: `"districtMap": "1945"`, a körzeti adatsorok `megyekod` 1–16, `oevk` 1, a régiók `megyekods: [n]`.

# Hírek írása GitHub Discussionsben

A játék „Újdonságok” szekciója, a `/hirek` archívum és a részletező oldal a
repó **Hírek** discussion-kategóriájából töltődik. Ez a leírás azt mutatja meg,
hogyan lesz egy discussionből jól kinéző hír.

## Hol és hogyan

- Csak a **Hírek** kategóriában nyitott discussion lesz hír. Lezárva
  (_Close_), másik kategóriába áthelyezve vagy törölve eltűnik a játékból.
- Nincs piszkozat: a létrehozás pillanatában megjelenik. Ha előbb meg akarod
  írni, nyisd egy másik kategóriában (pl. General), és ha kész, helyezd át a
  Hírekbe.
- A szerkesztés élesben a webhookkal azonnal átjön, egyébként a következő
  szinkronnál (induláskor és 15 percenként).

## Elemek

| Elem               | Hogyan add meg                                             | Hol látszik                                                       |
| ------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| **Cím**            | A discussion címe                                          | Mindenhol; a kis kártyákon legfeljebb 2 sor                       |
| **Típus-jelvény**  | Címke: `uj-funkcio`, `frissites`, `kampany` vagy `javitas` | Borostyán jelvény / kék felirat; címke nélkül nincs jelvény       |
| **Kiemelt hír**    | A discussion kitűzése (_Pin discussion_)                   | A landing nagy kártyája; ha nincs kitűzött, a legfrissebb         |
| **Borítókép**      | A szöveg **első képe**                                     | Landing kiemelt: nagy; kis kártyák: négyzetes; részletező: nagy   |
| **Lead**           | Az **első bekezdés**                                       | Landing kiemelt kártya, archívum                                  |
| **CTA-gomb**       | Az **utolsó bekezdés**, ha csak egy link                   | Landing: link a kártya alján; részletező: gomb                    |
| **Lejárat**        | Utolsó sor: `lejár: 2026-11-01`                            | A dátum után a hír csak az archívumban látszik                    |
| **Angol változat** | Címke: `lang:en`                                           | Angol nézetben; amíg nincs angol hír, ott is a magyarok látszanak |

A címkéket a repó **Labels** oldalán egyszer létre kell hozni. A név lehet olvasható is: az „Új funkció”, „Frissítés”, „Kampány” és „Javítás” ugyanúgy működik, a kis- és nagybetű, az ékezet és a szóköz nem számít. Ha egy hírnek
több típuscímkéje van, az elsőt veszi ebben a sorrendben: `uj-funkcio`,
`frissites`, `kampany`, `javitas`.

## Borítókép

- Elég behúzni a képet a szerkesztőbe; a `![](...)` és a GitHub által
  beszúrt `<img ...>` is működik.
- Mindig a szöveg **első képe** lesz a borító, bárhol is van, és kikerül a
  szövegből.
- A backend egy **1200×675-ös (16:9)** és egy **320×320-as négyzetes**
  változatot készít. A vágás a kép leglényegesebb részére igazodik, de a
  fontos tartalom inkább legyen középen.
- Legalább 1200 px széles, 16:9-es képet tölts fel; a kisebbet felnagyítja.
- Kép nélkül csíkos helykitöltő jelenik meg.
- A többi kép a szövegben marad, legfeljebb 1200 px szélesen.

## Lead

- Az első bekezdés a kép eltávolítása után; a címsorokat átugorja.
- Sima szöveg lesz, a formázás (félkövér stb.) elvész. Legyen 1–2 mondat.

## CTA-gomb

```
[Kipróbálom →](https://kampanykorut.hu/menu)
```

- Az utolsó bekezdés csak ez az egy link legyen. A felirat pontosan így
  jelenik meg, a `→`-t is bele kell írni.
- Csak `http(s)://` link lehet. A kampanykorut.hu linkek ugyanabban a lapon,
  a többi új lapon nyílik.
- A link előtti vagy utáni írásjel (`.`, `,`, `!` stb.) nem számít, lemarad.
- Sima URL, vagy ha a link mellett más szöveg is áll, nem lesz gomb, hanem
  szövegközi link marad.

## Lejárat

```
lejár: 2026-11-01
```

- A **legutolsó sor** legyen, a CTA után. A `lejárat:` és a `lejar:` is jó.
- A megadott napon még látszik, budapesti éjfélkor tűnik el a landingről.
- Érvénytelen dátumnál (pl. `2026-02-30`) a sor szövegként a hírben marad.

## Formázás a részletezőben

- **Működik:** bekezdés és sortörés (a sima sortörés is), **félkövér**,
  _dőlt_, ~~áthúzott~~, felsorolás és számozott lista, link, kép, idézet
  (`>`), címsor (`#`/`##` nagyobb, `###` és mélyebb kisebb).
- **Formázás nélkül jelenik meg:** táblázat, kódblokk, inline kód,
  egyedi HTML-stílus. Videó-, iframe- és script-beágyazás teljesen kikerül.

## Hozzászólások

A részletező oldal alján „Hozzászólás GitHubon” link vezet a discussionre;
a hozzászólásokat a GitHubon kell moderálni.

## Minta

```
![](borítókép behúzva ide)

Mostantól saját kampányt is írhatsz a Mod-készítővel, és linkkel megoszthatod bárkivel.

## Mi újság?
- saját kérdéssorok és jelöltek
- **megosztás** egy kattintással

[Kipróbálom →](https://kampanykorut.hu/menu)

lejár: 2026-11-30
```

Címke: `uj-funkcio`; ha ez legyen a nagy kártya, kitűzés (_Pin_).

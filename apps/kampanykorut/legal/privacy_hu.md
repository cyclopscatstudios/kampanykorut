# Adatkezelési tájékoztató

_Hatályos: 2026. október 25._

A Kampánykörút egy ingyenes, nem kereskedelmi, hobbiprojektként fejlesztett, böngészőben játszható választási kampányszimulátor.

Fontos számunkra a magánszférád védelme. Ez a tájékoztató bemutatja, milyen adatokat kezelünk a játék használata során, miért van szükségünk ezekre, és milyen lehetőségeid vannak az adataiddal kapcsolatban.

## Ki kezeli az adatokat?

A Kampánykörút független hobbiprojekt, amelyet a Cyclops Cat Studios projektnév alatt teszünk közzé. A Cyclops Cat Studios nem önálló jogi személy.

**Adatkezelő:** Bekó Dániel

**Projekt:** Cyclops Cat Studios

**Kapcsolat:** hello@kampanykorut.hu

Adatkezeléssel kapcsolatos kérdéseiddel vagy kéréseiddel ezen az e-mail-címen fordulhatsz hozzánk.

## Milyen adatokat gyűjtünk?

A játék regisztráció és felhasználói fiók nélkül használható. Nem kérjük el a nevedet, és a játékhoz nem szükséges megadnod az e-mail-címedet sem.

A játék működésének javítása, a hibák felderítése és az önkéntes hibabejelentések kezelése érdekében azonban bizonyos technikai és használati adatokat feldolgozunk.

Nem használunk reklámcélú követést, és nem értékesítjük a játékosok adatait.

## A weboldal kiszolgálása

A játékot, a háttérszolgáltatást és a hibabejelentések adatbázisát (MongoDB) egy saját üzemeltetésű virtuális szerveren futtatjuk, Docker-konténerekben.

**Tárhelyszolgáltató:** Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Németország (https://www.hetzner.com/)

**Adatkezelés helye:** Németország, Európai Unió.

A szerver előtt álló HTTPS-proxyban (Caddy) nincs bekapcsolva részletes látogatási (HTTP-hozzáférési) naplózás. A rendszer technikai üzeneteit tartalmazó rendszernaplót (systemd journal) legfeljebb 30 napig, legfeljebb 500 MB terjedelemben őrizzük meg.

Ettől függetlenül a weboldal kiszolgálásakor technikai okból elkerülhetetlenül feldolgozzuk a kapcsolat adatait, köztük az IP-címedet. A játékot kiszolgáló és a háttérszolgáltatást futtató konténerek saját technikai naplót is vezethetnek; a háttérszolgáltatás naplója a hozzá beérkező kérések (például hírek betöltése, hibabejelentés) esetén tartalmazhatja az IP-címedet is. Ezekre a naplókra a rendszernapló 30 napos korlátja nem vonatkozik; kizárólag üzemeltetési és hibakeresési célra használjuk őket.

A betűtípusokat és a játék többi fájlját saját szerverünkről töltjük be; nem használunk külső betűtípus-szolgáltatót.

**Jogalap:** a weboldal biztonságos működtetéséhez fűződő jogos érdek (GDPR 6. cikk (1) bekezdés f) pont).

## Névtelen használati statisztikák

A PostHog szolgáltatás segítségével azt vizsgáljuk, hogyan használják a játékot, és hol ütköznek nehézségekbe a játékosok.

A használati statisztika **alapértelmezés szerint be van kapcsolva**: a játék betöltésekor automatikusan elindul, külön hozzájárulást nem kérünk hozzá. A Beállításokban bármikor kikapcsolhatod (lásd lent).

Az általunk küldött események például a következőkről szólhatnak:

- Melyik kampányt és játszható oldalt választottad.
- Elindult-e és megfelelően betöltődött-e a kampány.
- Hányadik körig jutottál, illetve befejezted-e a játékot.
- Mi lett a játék végeredménye: győzelem, vereség vagy patthelyzet.
- Mennyi ideig tartott a betöltés.
- Előfordult-e mentési hiba.
- Melyik játékverziót használtad.

A PostHog az eseményekhez automatikusan hozzáadja a böngésző és az operációs rendszer típusát, a böngésző azonosító szövegét (user-agent), az eszköz típusát, a képernyőméretet, az időzónát, a böngésző nyelvét, a megnyitott oldal címét, az előző oldal címét (referrer) és az oldal címét. Az oldalcímekből küldés előtt eltávolítjuk a játékmenet azonosítóját.

A használati statisztikákban nem rögzítjük a kérdésekre adott konkrét válaszaidat.

**Mit nem használunk:** sütiket, a böngészőben tárolt tartós statisztikai azonosítót, munkamenet-visszajátszást (session replay), automatikus kattintásrögzítést, kérdőíveket, funkciókapcsolókat (feature flag) és távoli konfigurációt. Az események összekapcsolására szolgáló véletlenszerű azonosító csak az aktuális oldalbetöltés idejére, a böngésző memóriájában jön létre; az oldal újratöltése után új azonosító keletkezik. A statisztika nem olvassa a böngésződben tárolt mentett játékállásokat. Nem hozunk létre tartós játékosprofilt.

**IP-cím:** a hálózati kapcsolat miatt az IP-címed technikailag eljut a PostHoghoz, de úgy állítottuk be a szolgáltatást, hogy az IP-címet ne tárolja az eseményekhez.

**Cél:** a játék használatának megértése, a problémák feltárása és a játék fejlesztése.

**Szolgáltató:** PostHog, európai uniós adatfeldolgozási régió.

**Megőrzési idő:** a PostHog projekt adatmegőrzési beállításai szerint; az eseményeket legfeljebb 12 hónapig kívánjuk megőrizni.

**Jogalap:** a játék fejlesztéséhez fűződő jogos érdekünk (GDPR 6. cikk (1) bekezdés f) pont). Az adatkezelés ellen bármikor tiltakozhatsz a statisztika kikapcsolásával vagy a fenti e-mail-címen.

### Hogyan kapcsolhatod ki?

A Beállításokban bármikor kikapcsolhatod a „Névtelen használati statisztikák küldése” lehetőséget.

A kikapcsolás után a játék ebből a böngészőből nem küld további használati statisztikákat, és a következő oldalbetöltéstől már el sem indítja a PostHogot, így nem is kapcsolódik hozzá. A választásodat a böngésző helyi tárhelyén tároljuk (a PostHog egy kikapcsolást jelző bejegyzést is elhelyez ott), hogy ne kelljen minden alkalommal újra beállítanod. Ha később visszakapcsolod, a statisztika újra elindul.

A korábban elküldött statisztikai eseményeket a kikapcsolás nem törli automatikusan.

## Automatikus hibakövetés

A programhibák felismeréséhez és javításához a Sentry szolgáltatást használjuk.

Hiba esetén a következő technikai információk kerülhetnek továbbításra:

- A hibaüzenet és a kapcsolódó technikai hibanyom.
- A böngésző és az operációs rendszer jellemzői.
- A játék verziója és az érintett oldal címe.
- A hibát megelőző technikai események.

Emellett a munkamenetek egy kis részéből (körülbelül 20%-ából) hiba nélkül is küldünk teljesítményadatokat, például oldalbetöltési időket.

Küldés előtt a hibajelentésekből és a teljesítményadatokból automatikusan eltávolítjuk a játékbeli döntéseidet (a választott oldalt, a válaszaidat és a meglátogatott körzetet), valamint a játékmenet azonosítóját.

**Cél:** programhibák felismerése, kivizsgálása és elhárítása.

**Szolgáltató:** Sentry (Functional Software, Inc.), ingyenes fejlesztői csomag.

**Adatkezelés helye:** Európai Unió (Frankfurt, Németország).

**Jogalap:** az üzemeltetőnek a játék biztonságos és megfelelő működéséhez fűződő jogos érdeke (GDPR 6. cikk (1) bekezdés f) pont).

**Adatmegőrzés:** 30 nap.

A hibakövetés a használati statisztikák kikapcsolásától függetlenül működik.

## Önkéntes hibabejelentés

Ha a játék hibabejelentő űrlapját használod, a bejelentésből GitHub Issue készülhet a projekt nyilvános GitHub-tárhelyén.

A nyilvános bejegyzés tartalmazhatja a bejelentés címét, leírását, a hiba reprodukálásának lépéseit, valamint a kapcsolódó technikai adatokat, például a kampányt, a böngésző típusát, az oldal címét és a játék verzióját.

**A GitHub-bejegyzéseket bárki elolvashatja.** Ezért kérjük, ne adj meg személyes vagy bizalmas információkat a hibaleírásban.

A bejelentést a saját szerverünkön futó adatbázisban is tároljuk. Ha megadod az e-mail-címedet, azt nem tesszük közzé a GitHubon: kizárólag a hibabejelentéssel kapcsolatos kapcsolattartásra és állapotértesítésekre használjuk. Az értesítő e-maileket a Google (Gmail) szolgáltatásán keresztül küldjük. Az állapotértesítésekről bármikor leiratkozhatsz; ekkor az e-mail-címedet azonnal töröljük.

A visszaélések és automatizált beküldések kiszűrésére Cloudflare Turnstile ellenőrzést használunk, amelynek működése során technikai adatok kerülhetnek a Cloudflare-hez. Ugyanebből a célból az IP-címed sózott, egyirányú lenyomatát (hash) tároljuk a bejelentés mellett; magát az IP-címet erre a célra nem tároljuk.

**Jogalap:** a bejelentés kezeléséhez és a visszaélések megelőzéséhez fűződő jogos érdek (GDPR 6. cikk (1) bekezdés f) pont); az e-mail-értesítések esetében a hozzájárulásod (GDPR 6. cikk (1) bekezdés a) pont), amelyet a leiratkozással bármikor visszavonhatsz.

**Adatmegőrzés:** a bejelentést a saját adatbázisunkból – az e-mail-címmel és az IP-lenyomattal együtt – a beküldéstől számított 12 hónap elteltével automatikusan töröljük. A nyilvános GitHub-bejegyzések a projekt dokumentációjának részeként fennmaradhatnak.

## A böngésződben tárolt adatok

A mentett játékállásokat és a játékbeállításokat a böngésződ helyi tárhelyén tároljuk.

Ezek lehetővé teszik, hogy később folytathasd a játékot, és megőrizzük a választott beállításaidat.

A mentett játékállásokat nem továbbítjuk automatikusan a szerverünkre, és nem tároljuk őket központi játékosfiókban.

A helyi adatok eltávolíthatók a böngésző webhelyadatainak törlésével. Ez a mentett játékállásaid elvesztésével is járhat.

## Külső szolgáltatók

A játék működtetéséhez az alábbi külső szolgáltatásokat használjuk:

| Szolgáltatás         | Feladat                                          | Adatkezelés helye                 |
| -------------------- | ------------------------------------------------ | --------------------------------- |
| Hetzner Online GmbH  | A weboldal, a háttérszolgáltatás és az adatbázis | Németország, EU                   |
| PostHog              | Használati statisztikák                          | EU                                |
| Sentry               | Hiba- és teljesítményfigyelés                    | EU (Frankfurt)                    |
| GitHub               | Nyilvános hibabejelentések                       | Egyesült Államok / nemzetközi     |
| Google (Gmail)       | Hibabejelentési értesítő e-mailek                | Globális, az EGT-n kívül is lehet |
| Cloudflare Turnstile | Automatizált beküldések és visszaélések szűrése  | Globális                          |

A GitHub, a Google és a Cloudflare az Európai Gazdasági Térségen kívül is kezelhet adatokat. Ilyen esetben a szolgáltatók a saját adatvédelmi feltételeikben rögzített garanciákat alkalmazzák (ezek szolgáltatónként eltérhetnek, például az EU–USA adatvédelmi keretrendszer vagy az Európai Bizottság általános szerződési feltételei). A Gmail esetében nem tudjuk garantálni, hogy az adatok kizárólag az Európai Unióban maradnak.

## Milyen jogaid vannak?

A személyes adataiddal kapcsolatban a GDPR által biztosított feltételek szerint kérhetsz:

- Tájékoztatást az adatkezelésről és hozzáférést az adataidhoz.
- Pontatlan adatok helyesbítését.
- Adataid törlését vagy kezelésük korlátozását.
- Tiltakozhatsz a jogos érdeken alapuló adatkezelés ellen.
- Adott esetben élhetsz az adathordozhatósághoz való jogoddal.

Kérésedet a hello@kampanykorut.hu címre küldheted.

Mivel nem használunk regisztrációhoz kötött felhasználói azonosítót, bizonyos statisztikai eseményeket nem feltétlenül tudunk egy konkrét személyhez kapcsolni. Ha azonosításuk nem lehetséges, előfordulhat, hogy az egyedi visszakeresési vagy törlési kérést sem tudjuk teljesíteni.

Ha úgy gondolod, hogy az adatkezelés sérti a jogaidat, panaszt tehetsz a Nemzeti Adatvédelmi és Információszabadság Hatóságnál: https://www.naih.hu

## A tájékoztató módosítása

A játék fejlesztésével az adatkezelés is változhat. A lényeges változásokról a tájékoztató frissítésével, szükség esetén külön értesítéssel adunk tájékoztatást.

A mindenkor érvényes változat a Kampánykörút weboldalán érhető el.

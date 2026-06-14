import { useNavigate } from "react-router";
import { useTranslateLang } from "../../../logic/useTranslateLang";
import { Button } from "../Button";
import { Heading } from "../Heading";
import { Icon } from "../Icon";
import { Text } from "../Text";

export function AboutMenu() {
  const navigate = useNavigate();
  const backButton = useTranslateLang("menuList.button.back");
  return (
    <div className="mx-5">
      <div className="h-[600px] bg-blue-50/10 overflow-y-auto">
        <div className="m-4">
          <Heading className="mb-4">Kampánykörút</Heading>
          <Heading level={2} className="mb-2">
            Mi az a Kampánykörút?
          </Heading>
          <Text>
            A Kampánykörút egy magyar politikai stratégiai és választási
            szimulációs játék. A játék célja, hogy a játékos különböző
            történelmi vagy alternatív politikai kampányokat éljen át, és saját
            döntésein keresztül alakítsa azok kimenetelét.
            <br />
            <br />
            A kampány során fontos stratégiai döntéseket kell meghoznod: mely
            témákra helyezed a hangsúlyt, hogyan reagálsz a váratlan
            eseményekre, hol kampányolsz, és milyen üzenetekkel próbálod
            meggyőzni a választókat. Minden döntés hatással lehet a
            közvéleményre és végső soron a választás eredményére.
            <br />
            <br />A Kampánykörút célja nem az, hogy megmondja, mi történt vagy
            mi történt volna biztosan, hanem hogy lehetőséget adjon különböző
            politikai stratégiák és alternatív forgatókönyvek felfedezésére.
          </Text>
          <hr className="my-4 h-[2px] bg-blue-500 border-0" />
          <Heading level={2}>Hogyan működik?</Heading>
          <Text>
            A játék elején kiválaszthatsz egy kampányt és egy játszható
            szereplőt. Ez lehet egy politikai párt, jelölt vagy más történelmi
            szereplő, a választott kampánytól függően.
            <br />
            <br />
            A kampány során kérdésekkel, eseményekkel és döntési helyzetekkel
            találkozol. Minden válaszod hatással lehet a választói
            támogatottságra, a kampány dinamikájára és az egyes régiók politikai
            hangulatára.
            <br />
            <br />A kampány végén a játék kiszámítja a választás eredményét a
            meghozott döntések alapján, így akár jelentősen eltérő kimenetelek
            is születhetnek ugyanabból a kiinduló helyzetből.
          </Text>
          <hr className="my-4 h-[2px] bg-blue-500 border-0" />
          <Heading level={2}>Történelmi hitelesség és fikció</Heading>
          <Text>
            A Kampánykörút valós történelmi eseményekből, választási
            eredményekből, közvélemény-kutatásokból és politikai folyamatokból
            merít inspirációt. Ugyanakkor a játék számos ponton leegyszerűsíti
            vagy modellezi a valóságot annak érdekében, hogy szórakoztató és
            játszható élményt nyújtson.
            <br />
            <br />
            A játékban szereplő események, párbeszédek, döntési helyzetek és
            következmények nem tekinthetők történelmi ténynek. A kampányok
            gyakran alternatív történelmi forgatókönyveket mutatnak be, amelyek
            kizárólag a játék részeként léteznek.
            <br />
            <br />A Kampánykörút nem politikai elemzés, nem történelmi tananyag,
            és nem alkalmas arra, hogy egy választás vagy politikai esemény
            tényleges kimenetelét megjósolja.
          </Text>
          <hr className="my-4 h-[2px] bg-blue-500 border-0" />
          <Heading level={2}>Politikai semlegesség</Heading>
          <Text>
            A Kampánykörút nem támogat és nem ellenzi egyik politikai pártot,
            ideológiát vagy közéleti szereplőt sem.
            <br />
            <br />A játék célja a politikai kampányok stratégiai oldalának
            bemutatása, valamint annak vizsgálata, hogy különböző döntések
            milyen hatással lehetnek egy választási kampány alakulására. A
            játékban szereplő nézetek és álláspontok a történelmi szereplők,
            pártok vagy kampányok megjelenítését szolgálják, és nem feltétlenül
            tükrözik a fejlesztő véleményét.
          </Text>
          <hr className="my-4 h-[2px] bg-blue-500 border-0" />
          <Heading level={2}>Köszönetnyilvánítás</Heading>
          <Text>
            A Kampánykörút létrejöttét elsősorban a The Campaign Trail
            inspirálta.
            <br />
            <br />
            Külön köszönet illeti Dan Bryant, aki létrehozta az eredeti játékot
            és az azt befogadó American History USA oldalt. Az ő munkája mutatta
            meg, hogy a választási kampányok történelmét és stratégiáját
            interaktív formában is izgalmas módon lehet bemutatni.
            <br />
            <br />
            Köszönet továbbá a The Campaign Trail közösségének, amely az évek
            során számos új kampánnyal, ötlettel és fejlesztéssel bővítette az
            eredeti koncepciót.
            <br />
            <br />
            Az eredeti projekt:
            <br />
            http://www.americanhistoryusa.com/
            <br />
            <br />
            A közösség által fenntartott New Campaign Trail projekt:
            <br />
            https://github.com/newcampaigntrail/newcampaigntrail.github.io
            <br />
            <br />A Kampánykörút nem hivatalos The Campaign Trail projekt, hanem
            egy önálló, rajongói inspirációból született magyar fejlesztés,
            amely a magyar politika és választások világát próbálja hasonló
            formában feldolgozni.
          </Text>
          <hr className="my-4 h-[2px] bg-blue-500 border-0" />
          <Heading level={2}>A projektről</Heading>
          <Text>
            A Kampánykörút egy független, nem hivatalos hobbi projekt, amelyet
            egyetlen fejlesztő készít szabadidejében.
            <br />
            <br />
            A projekt célja, hogy magyar történelmi és politikai eseményeket
            dolgozzon fel egy olyan formában, amely egyszerre szórakoztató,
            újrajátszható és lehetőséget ad különböző történelmi forgatókönyvek
            kipróbálására.
            <br />
            <br />A játék folyamatos fejlesztés alatt áll, ezért a jövőben új
            kampányok, mechanikák és funkciók jelenhetnek meg.
          </Text>
          <hr className="my-4 h-[2px] bg-blue-500 border-0" />
          <Heading level={2}>Adatforrások</Heading>
          <Text>
            A Kampánykörút kampányai és választási szimulációi részben a Nemzeti
            Választási Iroda által közzétett hivatalos választási adatokra
            épülnek.
            <br />
            <br />
            A játékban szereplő egyes események, leírások és szimulációs elemek
            emellett különböző nyilvánosan elérhető történelmi és sajtóforrások
            alapján készülhetnek.
            <br />
            <br />
            Bár a Kampánykörút törekszik a történelmi háttér hiteles
            bemutatására, a játék elsődleges célja a szórakoztatás és az
            alternatív politikai forgatókönyvek szimulációja, ezért a játékmenet
            során alkalmazott modellek és mechanikák nem tekinthetők a valóság
            pontos leképezésének.
          </Text>
        </div>
      </div>
      <div className="mt-4">
        <Button
          variant="tertiary"
          size="large"
          block
          onClick={() => navigate(-1)}
        >
          <Icon name="backspace-fill" />
          <Text weight="medium" color="lightBlue">
            {backButton}
          </Text>
        </Button>
      </div>
    </div>
  );
}

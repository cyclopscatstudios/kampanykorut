import { useNavigation } from "../hooks/navigationHook";
import { Button } from "./ui/Button";
import { Heading } from "./ui/Heading";
import { Text } from "./ui/Text";
import errorImg from "../../public/broken-route.svg";

export function ErrorPage() {
  const { goToMainMenu, reloadPage } = useNavigation();
  return (
    <div className="h-screen w-screen flex flex-col gap-5 justify-center items-center">
      <img src={errorImg} alt="Error 404 - Not found" className="w-50 h-auto" />
      <Text color="red">Váratlan hiba történt</Text>
      <span>
        <Heading level={2} color="darkBlue">
          {" "}
          Letértünk az
        </Heading>
        <Heading level={2} color="blue">
          {" "}
          útvonalról.
        </Heading>
      </span>
      <div className="w-[400px]">
        <Text color="gray">
          Valami félresikerült a háttérben, és nem tudtuk befejezni a kérést.
          Térj vissza a főoldalra, vagy próbáld újratölteni az oldalt — sok
          esetben már ez is elég.
        </Text>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={reloadPage}>
          <Button.Icon name="arrow-clockwise" />
          <Button.Text>Oldal újratöltése</Button.Text>
        </Button>
        <Button onClick={goToMainMenu}>
          <Button.Icon name="house-fill" />
          <Button.Text>Vissza a főoldalra</Button.Text>
        </Button>
      </div>
    </div>
  );
}

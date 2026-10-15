import { useEffect } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";
import errorImg from "/broken-route.svg?url";
import { createLogger } from "@/shared/logger";
import { Button } from "../../../../shared/ui/Button";
import { Text } from "../../../../shared/ui/Text";
import { useNavigation } from "../hooks/navigationHook";
import { Heading } from "./ui/Heading";

const log = createLogger("ErrorPage");

export function ErrorPage() {
  const { goToMainMenu, reloadPage } = useNavigation();
  const error = useRouteError();

  useEffect(() => {
    const path = window.location.pathname + window.location.search;
    if (isRouteErrorResponse(error)) {
      log.error("Route error response", {
        status: error.status,
        statusText: error.statusText,
        path,
      });
      return;
    }
    log.error("Unhandled route error", { error, path });
  }, [error]);
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

import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Text } from "../components/ui/Text";
import { UiKit } from "./UiKit";
import { Logic } from "./Logic";

type Page = "ui-kit" | "logic";

function DevApp() {
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  return (
    <div className="w-screen h-screen">
      <Text weight="bold" color="dark-blue" className="text-center">
        Dev testing
      </Text>
      <div className="flex gap-4 w-full justify-center">
        <Button onClick={() => setCurrentPage("ui-kit")}>
          <Button.Text>Ui-kit</Button.Text>
        </Button>
        <Button onClick={() => setCurrentPage("logic")}>
          <Button.Text>Logic</Button.Text>
        </Button>
        <Button onClick={() => setCurrentPage(null)}>
          <Button.Text>Homepage</Button.Text>
        </Button>
      </div>
      {currentPage === "ui-kit" && <UiKit />}
      {currentPage === "logic" && <Logic />}
    </div>
  );
}

export default DevApp;

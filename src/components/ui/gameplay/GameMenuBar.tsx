import { Text } from "../Text";
import logo from "../../../assets/logo_reworked.png";
import { Button } from "../Button";

export function MenuBar({ setIsOpen }: { setIsOpen: (val: boolean) => void }) {
  return (
    <div className="w-full border-b-2 border-blue-400">
      <div className="flex justify-between items-center mx-5">
        <div className="flex justify-center items-center gap-2">
          <div className="flex justify-center items-center">
            <img src={logo} className="size-5 mr-3" />
            <Text
              weight="bold"
              color="lightBlue"
              className="text-5xl mt-5 mb-5"
            >
              KAMPÁNYKÖRÚT
            </Text>
          </div>
          <Button variant="transparent">
            <Text
              weight="bold"
              color="lightBlue"
              className="text-5xl mt-5 mb-5"
            >
              MAP
            </Text>
          </Button>
          <Button variant="transparent">
            <Text
              weight="bold"
              color="lightBlue"
              className="text-5xl mt-5 mb-5"
            >
              DASHBOARD
            </Text>
          </Button>
        </div>
        <div className="flex justify-center gap-2">
          <Button variant="transparent">
            <Text
              weight="bold"
              color="lightBlue"
              className="text-5xl mt-5 mb-5"
            >
              SAVE
            </Text>
          </Button>
          <Button variant="transparent">
            <Text
              weight="bold"
              color="lightBlue"
              className="text-5xl mt-5 mb-5"
            >
              LOAD
            </Text>
          </Button>
          <Button variant="transparent" onClick={() => setIsOpen(true)}>
            <Text
              weight="bold"
              color="lightBlue"
              className="text-5xl mt-5 mb-5"
            >
              SETTINGS
            </Text>
          </Button>
          <Button variant="transparent">
            <Text
              weight="bold"
              color="lightBlue"
              className="text-5xl mt-5 mb-5"
            >
              LANGUAGE
            </Text>
          </Button>
        </div>
      </div>
    </div>
  );
}

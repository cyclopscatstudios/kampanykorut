import { Text } from "../Text";
import logo from "../../../assets/logo_reworked.png";
import { Button } from "../Button";
import { useNavigate } from "react-router";

export interface MenuBarProps {
  setIsOpenSettings: (val: boolean) => void;
  setIsOpenGameMenu: (val: boolean) => void;
}

export function GameMenuBar({
  setIsOpenGameMenu,
  setIsOpenSettings,
}: MenuBarProps) {
  const navigate = useNavigate();
  return (
    <div className="w-full border-b-2 border-blue-400">
      <div className="flex justify-between items-center mx-5">
        <div className="flex justify-center items-center gap-2">
          <div
            className="flex justify-center items-center cursor-pointer"
            onClick={() => setIsOpenGameMenu(true)}
          >
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
          <Button variant="transparent" onClick={() => setIsOpenSettings(true)}>
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
          <Button variant="transparent" onClick={() => navigate("/")}>
            <Text
              weight="bold"
              color="lightBlue"
              className="text-5xl mt-5 mb-5"
            >
              EXIT
            </Text>
          </Button>
        </div>
      </div>
    </div>
  );
}

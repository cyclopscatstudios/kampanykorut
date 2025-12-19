import { useState } from "react";
import { ButtonDev } from "./Button.dev";

export function UiKit() {
  const [currentUiKit, setCurrentUiKit] = useState("");
  return (
    <div className="w-full flex">
      <div className="w-[100px] h-full border border-blue-500">
        <ul>
          <li onClick={() => setCurrentUiKit("button")}>button</li>
        </ul>
      </div>
      <div className="w-[1000px]">
        {currentUiKit === "button" && <ButtonDev />}
      </div>
    </div>
  );
}

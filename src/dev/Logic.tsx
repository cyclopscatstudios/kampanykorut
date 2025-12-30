import { useState } from "react";
import { Calculator } from "./Calculator.dev";

export function Logic() {
  const [currentLogic, setCurrentLogic] = useState("");

  return (
    <div className="w-full flex">
      <div className="w-[100px] h-full border border-blue-500">
        <ul>
          <li onClick={() => setCurrentLogic("calculator")}>calculator</li>
        </ul>
      </div>
      <div className="w-[1000px]">
        {currentLogic === "calculator" && <Calculator />}
      </div>
    </div>
  );
}

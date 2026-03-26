import { useState } from "react";
import { ButtonDev } from "./Button.dev";
import { QuestionCardDev } from "./QuestionCard.dev";
import { BottomBarDev } from "./BottomBarDev";
import { FinalResultDev } from "./FinalResult.dev";
import { AdvisorModalDev } from "./AdvisorModal.dev";

export function UiKit() {
  const [currentUiKit, setCurrentUiKit] = useState("");
  return (
    <div className="w-full flex">
      <div className="w-[100px] h-full border border-blue-500">
        <ul>
          <li onClick={() => setCurrentUiKit("button")}>button</li>
          <li onClick={() => setCurrentUiKit("question-card")}>
            question card
          </li>
          <li onClick={() => setCurrentUiKit("bottom-bar")}>bottom bar</li>
          <li onClick={() => setCurrentUiKit("final-result")}>final result</li>
          <li onClick={() => setCurrentUiKit("advisor-modal")}>
            advisor modal
          </li>
        </ul>
      </div>
      <div className="w-[1000px]">
        {currentUiKit === "button" && <ButtonDev />}
        {currentUiKit === "question-card" && <QuestionCardDev />}
        {currentUiKit === "bottom-bar" && <BottomBarDev />}
        {currentUiKit === "final-result" && <FinalResultDev />}
        {currentUiKit === "advisor-modal" && <AdvisorModalDev />}
      </div>
    </div>
  );
}

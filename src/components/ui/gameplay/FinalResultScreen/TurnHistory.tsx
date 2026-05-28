import type { HistoryItem } from "@/logic/application";

interface TurnHistoryProps {
  history: HistoryItem[] | null;
}

export function TurnHistory({ history }: TurnHistoryProps) {
  if (!history) {
    return null;
  }

  return (
    <div>
      <h2>Turn History</h2>
      <ul>
        {history.map((item, index) => (
          <li key={index}>
            <p>Question: {item.questionId}</p>
            <p>Answer: {item.answerId}</p>
            <p>
              District: {item.visitedDistrict.oevk},{" "}
              {item.visitedDistrict.megyekod}
            </p>
            <p>Turn: {item.turn}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

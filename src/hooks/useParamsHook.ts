import { useParams as useGetParams } from "react-router-dom";

export function useParams() {
  const { id, sessionId } = useGetParams();

  return {
    campaignId: id,
    sessionId: sessionId,
  };
}

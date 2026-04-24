import { useParams as useGetParams } from "react-router-dom";

export function useParams() {
  const { id } = useGetParams();

  return {
    campaignId: id,
  };
}

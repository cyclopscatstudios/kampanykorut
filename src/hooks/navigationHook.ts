import { useNavigate } from "react-router";

export function useNavigation() {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const goToSideSelector = (campaignId: string) => {
    navigate(`sides/${campaignId}`);
  };

  const goToCampaign = (campaignId: string) => {
    navigate(`/game/${campaignId}`);
  };

  return {
    goBack,
    goToSideSelector,
    goToCampaign,
  };
}

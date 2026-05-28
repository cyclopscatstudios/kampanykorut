import { useNavigate } from "react-router";

export function useNavigation() {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const goToSideSelector = (campaignId: string) => {
    navigate(`sides/${campaignId}`);
  };

  const goToCampaign = (campaignId: string, sessionId: string) => {
    navigate(`/game/${campaignId}?sessionId=${sessionId}`);
  };

  const goToMainMenu = () => {
    navigate(`/`);
  };

  const goToCampaignSelector = () => {
    navigate("/new-game/classic");
  };

  const goToFinalResults = (campaignId: string, sessionId: string) => {
    navigate(`/game/${campaignId}/end-results?sessionId=${sessionId}`);
  };

  const reloadPage = () => {
    navigate(0);
  };

  return {
    goToMainMenu,
    goBack,
    goToSideSelector,
    goToCampaign,
    goToCampaignSelector,
    goToFinalResults,
    reloadPage,
  };
}

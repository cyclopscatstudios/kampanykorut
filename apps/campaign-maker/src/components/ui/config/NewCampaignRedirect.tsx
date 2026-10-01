import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { uuidGenerator } from "../../../logic/application/IdGenerator";
import { WIZARD_STEPS } from "./wizardSteps";

export function NewCampaignRedirect() {
  const draftId = useMemo(() => uuidGenerator(), []);

  return (
    <Navigate to={`/new-campaign/${draftId}/${WIZARD_STEPS[0].path}`} replace />
  );
}

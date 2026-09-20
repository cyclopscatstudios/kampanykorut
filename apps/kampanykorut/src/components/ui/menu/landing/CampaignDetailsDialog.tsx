import { t } from "i18next";
import { Button } from "../../../../../../../shared/ui/Button";
import { Text } from "../../../../../../../shared/ui/Text";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "../../Dialog";
import { Heading } from "../../Heading";
import type { Campaign } from "./types";

interface CampaignDetailsDialogProps {
  campaign: Campaign | null;
  onClose: () => void;
  onStartCampaign: (campaign: Campaign) => void;
}

export function CampaignDetailsDialog({
  campaign,
  onClose,
  onStartCampaign,
}: CampaignDetailsDialogProps) {
  return (
    <Dialog
      open={campaign !== null}
      onClose={onClose}
      panelClassName="w-full sm:max-w-lg"
    >
      {campaign && (
        <>
          <DialogHeader>
            <Heading level={3} color="white">
              {campaign.label}
            </Heading>
          </DialogHeader>
          <DialogBody>
            <div className="mx-auto w-full max-w-md sm:max-w-lg">
              <img
                src={`/images/${campaign.route}/${campaign.campaignBanner}`}
                alt={campaign.label}
                className="mb-4 max-h-[35vh] w-full rounded-md object-contain"
              />
            </div>
            <Text as="p" color="gray" size="sm" className="whitespace-pre-line">
              {campaign.description}
            </Text>
          </DialogBody>
          <DialogFooter>
            <Button
              className="w-full justify-center"
              onClick={() => onStartCampaign(campaign)}
            >
              <Button.Icon name="play-circle-fill" />
              <Button.Text>
                {t("landing.campaignDialog.startButton")}
              </Button.Text>
            </Button>
          </DialogFooter>
        </>
      )}
    </Dialog>
  );
}

import { t } from "i18next";
import { CampaignEventAnnouncement } from "@/shared/types";
import { Button } from "../../../../../../shared/ui/Button";
import { Text } from "../../../../../../shared/ui/Text";
import { Dialog, DialogBody, DialogHeader } from "../Dialog";
import { Heading } from "../Heading";
import { ImageWrapper } from "./ImageWrapper";

export function EventAnnouncementDialog({
  announcement,
  onClose,
}: {
  announcement: CampaignEventAnnouncement | undefined;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={Boolean(announcement)}
      onClose={onClose}
      panelClassName="md:w-[520px]"
      buttons={{
        primary: (
          <Button onClick={onClose} testId="eventAnnouncementClose">
            <Button.Text>{t("eventAnnouncement.close")}</Button.Text>
          </Button>
        ),
      }}
    >
      <DialogHeader>
        <Text size="xs" color="gray" className="uppercase tracking-[1.2px]">
          {t("eventAnnouncement.label")}
        </Text>
        <Heading color="lightBlue" level={3}>
          {announcement?.title}
        </Heading>
      </DialogHeader>
      <DialogBody>
        {announcement?.imageUri && (
          <ImageWrapper
            src={announcement.imageUri}
            type="final"
            className="mb-3 rounded-xl object-cover"
          />
        )}
        <Text className="leading-relaxed">{announcement?.body}</Text>
      </DialogBody>
    </Dialog>
  );
}

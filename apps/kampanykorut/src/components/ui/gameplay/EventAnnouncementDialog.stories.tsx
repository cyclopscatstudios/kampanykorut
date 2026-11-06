import type { Story } from "@ladle/react";
import { useState } from "react";
import type { CampaignEventAnnouncement } from "@/shared/types";
import vitezyMozgalom from "../../../../public/images/2024_budapest/szentkiralyi_visszalep.png";
import { EventAnnouncementDialog } from "./EventAnnouncementDialog";

const WITHDRAWAL: CampaignEventAnnouncement = {
  title: "Szentkirályi Alexandra visszalép",
  body: "Június 7., péntek reggel: Szentkirályi Alexandra visszalép a főpolgármester-választástól, és arra kéri a támogatóit, hogy Vitézy Dávidra szavazzanak. Két nap van hátra, és a verseny kétszereplőssé vált.",
};

const WITH_IMAGE: CampaignEventAnnouncement = {
  title: "Vitézy mögé rendeződnek a Karácsony-ellenesek",
  body: "Vitézy egyértelműen Szentkirályi előtt jár, és Szentkirályi szavazóinak egy része átpártol hozzá, hogy legyőzzék Karácsonyt. Amíg a különbség megmarad, a folyamat minden nappal erősödik.",
  imageUri: vitezyMozgalom,
};

function EventAnnouncementStory({
  announcement,
}: {
  announcement: CampaignEventAnnouncement;
}) {
  const [current, setCurrent] = useState<CampaignEventAnnouncement | undefined>(
    announcement,
  );

  return (
    <>
      <button type="button" onClick={() => setCurrent(announcement)}>
        Megnyitás
      </button>
      <EventAnnouncementDialog
        announcement={current}
        onClose={() => setCurrent(undefined)}
      />
    </>
  );
}

export const Default: Story = () => (
  <EventAnnouncementStory announcement={WITHDRAWAL} />
);

export const WithImage: Story = () => (
  <EventAnnouncementStory announcement={WITH_IMAGE} />
);

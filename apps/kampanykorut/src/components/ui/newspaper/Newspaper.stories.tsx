import type { Story } from "@ladle/react";
import { useState } from "react";
import type { NewspaperEditionView } from "@/shared/types";
import nephangLogo from "../../../../public/images/_0003_/newspaper/nephang-logo.svg";
import { NewspaperButton } from "./NewspaperButton";
import { NewspaperDialog, NewspaperDialogMode } from "./NewspaperDialog";

const EDITIONS: NewspaperEditionView[] = [
  {
    item: {
      id: "szivartartok",
      headline: "Szivartartók a Parlament folyosóján",
      lead: "A felsőházi ülésterem előtt számozott réztartók sorakoznak. A képviselők ide tették le égő szivarjukat, mielőtt beléptek a terembe.",
    },
    paper: {
      id: "nephang",
      name: "NÉPHANG",
      subtitle: "Független politikai napilap",
      logo: nephangLogo,
      price: "Ára: 4,80 Ft",
    },
    issue: 1,
    turn: 2,
  },
  {
    item: {
      id: "steindl-imre",
      headline: "Nem láthatta kész művét",
      lead: "Steindl Imre, az Országház tervezője élete végére megvakult, és néhány héttel az épület 1902-es átadása előtt elhunyt.",
    },
    paper: { id: "nephang", name: "NÉPHANG", logo: nephangLogo },
    issue: 2,
    turn: 4,
  },
];

function NewspaperStory({ mode }: { mode: NewspaperDialogMode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-screen bg-dark-blue p-4">
      <NewspaperButton
        hasUnread={!open}
        ribbon={open ? undefined : EDITIONS[1].item.headline}
        onOpen={() => setOpen(true)}
      />
      <NewspaperDialog
        open={open}
        mode={mode}
        editions={EDITIONS}
        year="2026"
        onRead={() => setOpen(false)}
        onOptOut={() => setOpen(false)}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

export const Arrival: Story = () => <NewspaperStory mode="arrival" />;

export const Archive: Story = () => <NewspaperStory mode="archive" />;

import { useState } from "react";
import { AdvisorModal } from "../components/ui/gameplay/AdvisorModal";

export function AdvisorModalDev() {
  const [open, setOpen] = useState(true);
  return (
    <div className="size-full bg-red-50">
      <div>asd</div>
      <AdvisorModal
        advice="Lorem ipsum dolore sit amet Lorem ipsum dolore sit amet  Lorem ipsum dolore sit amet "
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

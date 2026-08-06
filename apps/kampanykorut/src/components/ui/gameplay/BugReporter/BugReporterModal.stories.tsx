import type { Story } from "@ladle/react";
import { useState } from "react";
import { BugReporterModal } from "./BugReporterModal";

export const Default: Story = () => {
  const [isOpen, setIsOpen] = useState(true);

  return <BugReporterModal isOpen={isOpen} setIsOpen={setIsOpen} />;
};

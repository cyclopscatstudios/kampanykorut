import type { Story } from "@ladle/react";
import { useLayoutEffect, useState } from "react";
import type { BugReportEnvironment } from "@/shared/types";
import { BugReporterModal } from "./BugReporterModal";

const ENVIRONMENT: BugReportEnvironment = {
  campaign: "Országgyűlési választás 2026",
  url: "https://kampanykorut.hu/game",
  browser: "Ladle",
  version: "story",
};

const collectEnvironment = () => ENVIRONMENT;

function useMockedBugReportApi(respond?: () => Response) {
  useLayoutEffect(() => {
    if (!respond) return;

    const original = window.fetch;
    window.fetch = async (input, init) =>
      String(input).includes("/api/v1/bug-reports")
        ? new Promise((resolve) => setTimeout(() => resolve(respond()), 300))
        : original(input, init);

    return () => {
      window.fetch = original;
    };
  }, [respond]);
}

function BugReporterStory({ respond }: { respond?: () => Response }) {
  const [isOpen, setIsOpen] = useState(true);
  useMockedBugReportApi(respond);

  return (
    <BugReporterModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      collectEnvironment={collectEnvironment}
    />
  );
}

const respondSuccess = () =>
  Response.json({ id: "story", issueNumber: 123 }, { status: 202 });
const respondError = () =>
  Response.json(
    { status: 500, title: "Internal Server Error" },
    { status: 500 },
  );
const respondUnavailable = () =>
  Response.json({ status: 503, title: "Service Unavailable" }, { status: 503 });

export const Default: Story = () => <BugReporterStory />;

export const Success: Story = () => (
  <BugReporterStory respond={respondSuccess} />
);

export const ServerError: Story = () => (
  <BugReporterStory respond={respondError} />
);

export const Unavailable: Story = () => (
  <BugReporterStory respond={respondUnavailable} />
);

import { t } from "i18next";
import { Dispatch, SetStateAction, useState } from "react";
import { container } from "tsyringe";
import { ConfigEngine, Navigation } from "@/logic/application";
import { Button } from "../../../../../../../shared/ui/Button";
import { Icon } from "../../../../../../../shared/ui/Icon";
import { Text } from "../../../../../../../shared/ui/Text";
import { Tooltip } from "../../../../../../../shared/ui/Tooltip";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "../../Dialog";
import { Heading } from "../../Heading";
import { TextInput } from "../../TextInput";

interface BugReporterDialogProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

type BugReport = {
  title: string;
  description: string;
  steps: string;
};

const EMPTY_BUG_REPORT: BugReport = { title: "", description: "", steps: "" };

export function BugReporterModal({
  isOpen,
  setIsOpen,
}: BugReporterDialogProps) {
  const [bugReport, setBugReport] = useState<BugReport>(EMPTY_BUG_REPORT);

  const close = () => {
    setIsOpen(false);
    setBugReport(EMPTY_BUG_REPORT);
  };

  const handleReport = () => {
    openGitHubIssue(bugReport);
    close();
  };

  return (
    <>
      <Dialog open={isOpen} onClose={close}>
        <DialogHeader>
          <div>
            <Heading level={3} color="lightBlue">
              {t("bugReporter.title")}
            </Heading>
          </div>
        </DialogHeader>
        <DialogBody>
          <BugReporterBody value={bugReport} onChange={setBugReport} />
        </DialogBody>
        <DialogFooter>
          <div className="w-full flex justify-between gap-2">
            <Button variant="secondary" onClick={close}>
              <Button.Text>{t("menuList.button.cancel")}</Button.Text>
            </Button>
            <Button
              onClick={handleReport}
              disabled={
                !bugReport.title.trim() || !bugReport.description.trim()
              }
            >
              <Button.Text>{t("bugReporter.report")}</Button.Text>
            </Button>
          </div>
        </DialogFooter>
      </Dialog>
    </>
  );
}

function BugReporterBody({
  value,
  onChange,
}: {
  value: BugReport;
  onChange: Dispatch<SetStateAction<BugReport>>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex">
        <Tooltip content="Clicking Report will open a pre-filled GitHub issue.">
          <Icon
            name="exclamation-circle-fill"
            color="red"
            size="sm"
            className="mr-2"
          />
        </Tooltip>
        <Text size="sm" color="red">
          {t("bugReporter.warningText")}
        </Text>
      </div>
      <TextInput
        label={t("bugReporter.label.title")}
        value={value.title}
        onChange={(e) =>
          onChange((prev) => ({ ...prev, title: e.target.value }))
        }
        placeholder={t("bugReporter.palceholder.title")}
      />
      <TextInput
        label={t("bugReporter.label.description")}
        multiline
        value={value.description}
        onChange={(e) =>
          onChange((prev) => ({ ...prev, description: e.target.value }))
        }
        placeholder={t("bugReporter.palceholder.description")}
      />
      <TextInput
        label={t("bugReporter.label.steps")}
        multiline
        value={value.steps}
        onChange={(e) =>
          onChange((prev) => ({ ...prev, steps: e.target.value }))
        }
        placeholder={t("bugReporter.palceholder.steps")}
      />
    </div>
  );
}

function openGitHubIssue(report: BugReport) {
  const configEngine = container.resolve(ConfigEngine);
  const navigationService = container.resolve(Navigation);
  const isCampaignActive = navigationService.isUrlParamMatch("/game");
  const config = configEngine.getCurrentElectionConfig();
  const owner = "pankamacskastudios";
  const repo = "kampanykorut";

  const body = `
    ## Description

    ${report.description}

    ## Steps to Reproduce

    ${report.steps}

    ## Environment

    - Campaign: ${isCampaignActive && config?.title ? config.title : "-"}
    - URL: ${window.location.href}
    - Browser: ${navigator.userAgent}
    - Version: ${import.meta.env.VITE_APP_VERSION ?? "unknown"}
    `.trim();

  const params = new URLSearchParams({
    title: `[Bug]: ${report.title}`,
    body,
    labels: "bug",
  });

  const issueUrl = `https://github.com/${owner}/${repo}/issues/new?${params.toString()}`;

  window.open(issueUrl, "_blank", "noopener,noreferrer");
}

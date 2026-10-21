import { t } from "i18next";
import { Dispatch, SetStateAction, useState } from "react";
import { container } from "tsyringe";
import { ConfigEngine, Navigation } from "@/logic/application";
import type { BugReportEnvironment, BugReportResponse } from "@/shared/types";
import { Button } from "../../../../../../../shared/ui/Button";
import { Icon } from "../../../../../../../shared/ui/Icon";
import { Text } from "../../../../../../../shared/ui/Text";
import { Tooltip } from "../../../../../../../shared/ui/Tooltip";
import {
  BugReportApiError,
  githubIssueUrl,
  submitBugReport,
} from "../../../../logic/application/bugReport/bugReportApi";
import { TURNSTILE_SITE_KEY } from "../../../../logic/application/bugReport/turnstile";
import { Dialog, DialogBody, DialogFooter, DialogHeader } from "../../Dialog";
import { Heading } from "../../Heading";
import { TextInput } from "../../TextInput";
import { TurnstileWidget } from "./TurnstileWidget";

interface BugReporterDialogProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  collectEnvironment?: () => BugReportEnvironment;
  turnstileSiteKey?: string;
}

type BugReport = {
  title: string;
  description: string;
  steps: string;
  email: string;
  website: string;
};

type Submission =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success"; result: BugReportResponse; emailSent: boolean }
  | { state: "error"; unavailable: boolean };

const EMPTY_BUG_REPORT: BugReport = {
  title: "",
  description: "",
  steps: "",
  email: "",
  website: "",
};

export function BugReporterModal({
  isOpen,
  setIsOpen,
  collectEnvironment = currentEnvironment,
  turnstileSiteKey = TURNSTILE_SITE_KEY,
}: BugReporterDialogProps) {
  const [bugReport, setBugReport] = useState<BugReport>(EMPTY_BUG_REPORT);
  const [submission, setSubmission] = useState<Submission>({ state: "idle" });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileAttempt, setTurnstileAttempt] = useState(0);

  const close = () => {
    setIsOpen(false);
    setBugReport(EMPTY_BUG_REPORT);
    setSubmission({ state: "idle" });
    setTurnstileToken(null);
  };

  const handleReport = async () => {
    setSubmission({ state: "submitting" });
    const email = bugReport.email.trim();

    try {
      const result = await submitBugReport({
        title: bugReport.title.trim(),
        description: bugReport.description.trim(),
        steps: bugReport.steps.trim(),
        email: email || undefined,
        environment: collectEnvironment(),
        turnstileToken: turnstileToken ?? undefined,
        website: bugReport.website || undefined,
      });
      setSubmission({ state: "success", result, emailSent: !!email });
    } catch (err) {
      setSubmission({
        state: "error",
        unavailable: err instanceof BugReportApiError && err.status === 503,
      });
      setTurnstileToken(null);
      setTurnstileAttempt((attempt) => attempt + 1);
    }
  };

  const openOnGithub = () => {
    window.open(
      githubIssueUrl(bugReport, collectEnvironment()),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const submitting = submission.state === "submitting";
  const canSubmit =
    !submitting &&
    !!bugReport.title.trim() &&
    !!bugReport.description.trim() &&
    (!turnstileSiteKey || !!turnstileToken);

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
          {submission.state === "success" ? (
            <BugReporterSuccess
              issueNumber={submission.result.issueNumber}
              emailSent={submission.emailSent}
            />
          ) : (
            <div className="flex flex-col gap-3">
              <BugReporterBody
                value={bugReport}
                onChange={setBugReport}
                disabled={submitting}
              />
              {turnstileSiteKey && (
                <TurnstileWidget
                  key={turnstileAttempt}
                  siteKey={turnstileSiteKey}
                  onToken={setTurnstileToken}
                />
              )}
              {submission.state === "error" && (
                <div role="alert" className="flex flex-col gap-2">
                  <Text size="sm" color="red">
                    {t(
                      submission.unavailable
                        ? "bugReporter.error.unavailable"
                        : "bugReporter.error.failed",
                    )}
                  </Text>
                  <div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={openOnGithub}
                    >
                      <Button.Text>{t("bugReporter.fallback")}</Button.Text>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          {submission.state === "success" ? (
            <div className="w-full flex justify-end">
              <Button onClick={close}>
                <Button.Text>{t("bugReporter.close")}</Button.Text>
              </Button>
            </div>
          ) : (
            <div className="w-full flex justify-between gap-2">
              <Button variant="secondary" onClick={close}>
                <Button.Text>{t("menuList.button.cancel")}</Button.Text>
              </Button>
              <Button onClick={handleReport} disabled={!canSubmit}>
                {submitting && (
                  <span
                    aria-hidden
                    className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
                  />
                )}
                <Button.Text>
                  {t(submitting ? "bugReporter.sending" : "bugReporter.report")}
                </Button.Text>
              </Button>
            </div>
          )}
        </DialogFooter>
      </Dialog>
    </>
  );
}

function BugReporterSuccess({
  issueNumber,
  emailSent,
}: {
  issueNumber: number | null;
  emailSent: boolean;
}) {
  return (
    <div role="status" className="flex flex-col gap-2">
      <Text color="green">
        {issueNumber === null
          ? t("bugReporter.success.message")
          : t("bugReporter.success.messageWithIssue", { issueNumber })}
      </Text>
      {emailSent && <Text size="sm">{t("bugReporter.success.emailSent")}</Text>}
    </div>
  );
}

function BugReporterBody({
  value,
  onChange,
  disabled,
}: {
  value: BugReport;
  onChange: Dispatch<SetStateAction<BugReport>>;
  disabled: boolean;
}) {
  const field = (key: keyof BugReport) => (e: { target: { value: string } }) =>
    onChange((prev) => ({ ...prev, [key]: e.target.value }));

  const isEmailSupported = false;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex">
        <Tooltip content={t("bugReporter.tooltip")}>
          <Icon
            name="exclamation-circle-fill"
            color="yellow"
            size="sm"
            className="mr-2"
          />
        </Tooltip>
        <Text size="sm" color="yellow">
          {t("bugReporter.warningText")}
        </Text>
      </div>
      <TextInput
        label={t("bugReporter.label.title")}
        value={value.title}
        onChange={field("title")}
        placeholder={t("bugReporter.placeholder.title")}
        maxLength={120}
        disabled={disabled}
      />
      <TextInput
        label={t("bugReporter.label.description")}
        multiline
        value={value.description}
        onChange={field("description")}
        placeholder={t("bugReporter.placeholder.description")}
        maxLength={5000}
        disabled={disabled}
      />
      <TextInput
        label={t("bugReporter.label.steps")}
        multiline
        value={value.steps}
        onChange={field("steps")}
        placeholder={t("bugReporter.placeholder.steps")}
        maxLength={5000}
        disabled={disabled}
      />
      {isEmailSupported && (
        <TextInput
          label={t("bugReporter.label.email")}
          type="email"
          autoComplete="email"
          value={value.email}
          onChange={field("email")}
          placeholder={t("bugReporter.placeholder.email")}
          helperText={t("bugReporter.emailHelper")}
          maxLength={254}
          disabled={disabled}
        />
      )}
      <div
        aria-hidden
        className="absolute -left-[10000px] w-px h-px overflow-hidden"
      >
        <label>
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={value.website}
            onChange={field("website")}
          />
        </label>
      </div>
    </div>
  );
}

function currentEnvironment(): BugReportEnvironment {
  const configEngine = container.resolve(ConfigEngine);
  const navigationService = container.resolve(Navigation);
  const isCampaignActive = navigationService.isUrlParamMatch("/game");
  const config = configEngine.getCurrentElectionConfig();

  return {
    campaign: isCampaignActive && config?.title ? config.title : "",
    url: window.location.href,
    browser: navigator.userAgent,
    version: import.meta.env.VITE_APP_VERSION ?? "unknown",
  };
}

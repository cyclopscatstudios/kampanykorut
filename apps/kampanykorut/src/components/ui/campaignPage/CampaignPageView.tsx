import classNames from "classnames";
import { t } from "i18next";
import { Link } from "react-router-dom";
import { Button } from "../../../../../../shared/ui/Button";
import { Icon } from "../../../../../../shared/ui/Icon";
import { Text } from "../../../../../../shared/ui/Text";
import { Tooltip } from "../../../../../../shared/ui/Tooltip";
import { Heading } from "../Heading";
import {
  campaignBannerPath,
  type CampaignPageData,
  campaignPagePath,
  type CampaignPageSide,
} from "./campaignPage.data";

interface CampaignPageViewProps {
  data: CampaignPageData;
  onStart: (sideId?: string) => void;
}

export function CampaignPageView({ data, onStart }: CampaignPageViewProps) {
  const { campaign, sides, side } = data;

  return (
    <div className="flex flex-col gap-10" data-testid="campaignPage">
      <section className="relative overflow-hidden rounded-xl border border-blue-500/30">
        <img
          src={campaignBannerPath(campaign)}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0f172a] via-[#0f172a]/70 to-transparent" />
        <div className="relative flex flex-col gap-5 p-5 pt-36 sm:flex-row sm:items-end sm:justify-between sm:p-8 sm:pt-64">
          {side ? (
            <SideHero
              campaignId={campaign.id}
              campaignLabel={campaign.label}
              side={side}
            />
          ) : (
            <Heading level={1} color="white">
              {campaign.label}
            </Heading>
          )}
          <Button
            variant="primary"
            size="large"
            className="shrink-0"
            onClick={() => onStart(side?.id)}
            testId="campaignPageStart"
          >
            <Button.Icon name="play-circle-fill" />
            <Button.Text>{t("landing.campaignDialog.startButton")}</Button.Text>
          </Button>
        </div>
      </section>

      {side && (side.candidate.description || side.description) && (
        <Text as="p" color="gray" className="max-w-3xl">
          {side.candidate.description ?? side.description}
        </Text>
      )}

      {sides.length > 0 && (
        <section className="flex flex-col gap-4">
          <Heading level={4} color="white">
            {side ? t("campaignPage.otherSides") : t("campaignPage.sides")}
          </Heading>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {sides.map((s) => (
              <li key={s.id}>
                <SideCard
                  campaignId={campaign.id}
                  side={s}
                  active={s.id === side?.id}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <Heading level={4} color="white">
          {t("campaignPage.background")}
        </Heading>
        <Text as="p" color="gray" className="max-w-3xl whitespace-pre-line">
          {campaign.description}
        </Text>
      </section>
    </div>
  );
}

function SideHero({
  campaignId,
  campaignLabel,
  side,
}: {
  campaignId: string;
  campaignLabel: string;
  side: CampaignPageSide;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      {side.portrait && (
        <img
          src={side.portrait}
          alt={side.candidate.label}
          className="size-24 shrink-0 rounded-full border-2 border-blue-400/60 object-cover sm:size-32"
        />
      )}
      <div className="flex flex-col gap-1.5">
        <Link
          to={campaignPagePath(campaignId)}
          className="flex w-fit items-center gap-1 text-sm font-medium text-blue-300 hover:text-blue-200"
        >
          <Icon name="chevron-left" color="currentColor" />
          {campaignLabel}
        </Link>
        <Heading level={1} color="white">
          {side.candidate.label}
        </Heading>
        <span className="flex items-center gap-2">
          {side.partyLogo && (
            <img
              src={side.partyLogo}
              alt=""
              className="size-6 rounded-sm object-contain"
            />
          )}
          <Text as="span" color="lightBlue" weight="medium">
            {side.label}
          </Text>
        </span>
      </div>
    </div>
  );
}

function SideCard({
  campaignId,
  side,
  active,
}: {
  campaignId: string;
  side: CampaignPageSide;
  active: boolean;
}) {
  const card = (
    <Link
      to={campaignPagePath(campaignId, side.id)}
      aria-current={active ? "page" : undefined}
      className={classNames(
        "flex h-full flex-col items-center gap-3 rounded-lg border p-4 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
        active
          ? "border-blue-400 bg-blue-500/15"
          : "border-blue-500/30 bg-[rgba(148,163,184,0.05)] hover:border-blue-400/60 hover:bg-[rgba(148,163,184,0.1)]",
      )}
    >
      <span className="relative">
        {side.portrait ? (
          <img
            src={side.portrait}
            alt=""
            className="size-20 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-20 items-center justify-center rounded-full bg-slate-700 text-3xl text-slate-300">
            <Icon name="person-fill" />
          </span>
        )}
        {side.partyLogo && (
          <img
            src={side.partyLogo}
            alt=""
            className="absolute -right-1 -bottom-1 size-8 rounded-md border border-white/20 bg-[#0f172a] object-contain p-0.5"
          />
        )}
      </span>
      <span className="flex flex-col gap-0.5">
        <Text as="span" weight="bold" size="sm">
          {side.candidate.label}
        </Text>
        <Text as="span" color="gray" size="xs">
          {side.label}
        </Text>
      </span>
    </Link>
  );

  return side.description ? (
    <Tooltip content={side.description} block>
      {card}
    </Tooltip>
  ) : (
    card
  );
}

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  CampaignEngine,
  CampaignEventEngine,
  CandidateWithdrawalTransformer,
  DistrictGroupEngine,
  DistrictVoteTransformer,
  EffectApplier,
  getPlayerVoteKey,
  MandateCalculator,
  MayoralResultCalculator,
  PollsterEngine,
  ResultModifier,
  UnionSwingTransformer,
  VoterEnvironment,
  VoteShareTransformer,
} from "@shared/domain";
import type {
  CampaignConfig,
  CampaignState,
  CandidateConfig,
  GameSettings,
  HistoryItem,
  RawQuestion,
} from "@shared/types";
import type { CampaignManifest } from "@shared/types/configs/campaign-manifest";
import type {
  CampaignHeaderInput,
  CampaignSource,
  Diagnostic,
} from "@shared/validation/campaignValidator";
import { validateCampaign } from "@shared/validation/campaignValidator";
import { buildCampaignCatalog } from "../../plugins/campaignCatalog";

type SimulationMode = "first" | "last" | "random";

interface SimulationInput {
  campaignId: string;
  sideId: string;
  candidateId: string;
  runs?: number;
  seed?: number;
  mode?: SimulationMode;
  answerPlan?: Record<string, string>;
}

interface CandidateFiles {
  questions?: string;
  answerEffect?: string;
  campaignStrategies?: string;
  advisorFeedback?: string;
  politicalConfig?: string;
  campaignEvents?: string;
}

interface RuntimeCampaign extends Pick<
  CampaignConfig,
  | "electionConfig"
  | "voterEnvironmentConfig"
  | "candidateListData"
  | "partyListData"
  | "customGroups"
  | "customPollsters"
  | "campaignEvents"
  | "politicalConfig"
  | "playableSides"
  | "version"
> {
  route: string;
}

export function createCampaignMcpAdapter(publicDir: string) {
  const campaignsDir = path.join(publicDir, "campaigns");

  function getCampaign(campaignId: string) {
    const campaign = buildCampaignCatalog(campaignsDir).find(
      (entry) => entry.id === campaignId,
    );
    if (!campaign) throw new Error(`Unknown campaign ID: ${campaignId}`);
    return campaign;
  }

  function getManifest(route: string) {
    return readJson<CampaignManifest>(
      safePath(campaignsDir, route, "manifest.json"),
    );
  }

  function readCampaignJson<T>(route: string, relativePath: string): T {
    return readJson<T>(safePath(campaignsDir, route, relativePath));
  }

  function getSource(): CampaignSource {
    return {
      readCampaignFile(route, relativePath) {
        const filePath = safePath(campaignsDir, route, relativePath);
        try {
          return { ok: true, data: JSON.parse(readFileSync(filePath, "utf8")) };
        } catch (error) {
          const isMissing =
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "ENOENT";
          return {
            ok: false,
            reason: isMissing ? "missing" : "invalid-json",
            message: error instanceof Error ? error.message : String(error),
          };
        }
      },
      publicFileExists(publicPath) {
        try {
          return existsSync(safePath(publicDir, publicPath));
        } catch {
          return false;
        }
      },
    };
  }

  function loadRuntimeCampaign(
    campaignId: string,
    sideId: string,
    candidateId: string,
  ) {
    const campaign = getCampaign(campaignId);
    const manifest = getManifest(campaign.route);
    const candidateFiles = manifest.files.playableSides?.[sideId]?.[
      candidateId
    ] as CandidateFiles | undefined;
    if (!candidateFiles) {
      throw new Error(
        `Unknown playable side or candidate: ${sideId}/${candidateId}`,
      );
    }

    const readOptional = <T>(relativePath: string | undefined) =>
      relativePath
        ? readCampaignJson<T>(campaign.route, relativePath)
        : undefined;
    const electionConfig = readCampaignJson<CampaignConfig["electionConfig"]>(
      campaign.route,
      manifest.files.electionConfig,
    );
    if (
      manifest.files.regions &&
      electionConfig.election?.type === "proportional"
    ) {
      electionConfig.election.regions = readCampaignJson(
        campaign.route,
        manifest.files.regions,
      );
    }
    if (manifest.files.issues) {
      electionConfig.issues = readCampaignJson(
        campaign.route,
        manifest.files.issues,
      );
    }

    const candidateListData = readCampaignJson<
      CampaignConfig["candidateListData"]
    >(campaign.route, manifest.files.candidateListData);
    const voterEnvironmentConfig = readCampaignJson<
      CampaignConfig["voterEnvironmentConfig"]
    >(campaign.route, manifest.files.voterEnvironmentConfig);
    const playableSide: CandidateConfig = {
      questions:
        readOptional<CandidateConfig["questions"]>(candidateFiles.questions) ??
        [],
      answerEffect:
        readOptional<CandidateConfig["answerEffect"]>(
          candidateFiles.answerEffect,
        ) ?? [],
      campaignStrategies: readOptional<CandidateConfig["campaignStrategies"]>(
        candidateFiles.campaignStrategies,
      ),
      advisorFeedback: readOptional<CandidateConfig["advisorFeedback"]>(
        candidateFiles.advisorFeedback,
      ),
      politicalConfig: readOptional<CandidateConfig["politicalConfig"]>(
        candidateFiles.politicalConfig,
      ),
      campaignEvents: readOptional<CandidateConfig["campaignEvents"]>(
        candidateFiles.campaignEvents,
      ),
    };

    const config: RuntimeCampaign = {
      route: campaign.route,
      electionConfig,
      candidateListData,
      voterEnvironmentConfig: {
        ...voterEnvironmentConfig,
        listData: candidateListData,
      },
      partyListData: readOptional<CampaignConfig["partyListData"]>(
        manifest.files.partyListData,
      ),
      customGroups: readOptional<CampaignConfig["customGroups"]>(
        manifest.files.customGroups,
      ),
      customPollsters: readOptional<CampaignConfig["customPollsters"]>(
        manifest.files.customPollsters,
      ),
      campaignEvents: readOptional<CampaignConfig["campaignEvents"]>(
        manifest.files.campaignEvents,
      ),
      politicalConfig: readOptional<CampaignConfig["politicalConfig"]>(
        manifest.files.politicalConfig,
      ),
      version: manifest.metadata?.version,
      playableSides: { [sideId]: { [candidateId]: playableSide } },
    };

    return { campaign, manifest, config, playableSide };
  }

  function createEngine(
    config: RuntimeCampaign,
    sideId: string,
    candidateId: string,
  ) {
    const voterEnvironment = new VoterEnvironment();
    voterEnvironment.configure(config.voterEnvironmentConfig);

    const districtGroupEngine = new DistrictGroupEngine();
    districtGroupEngine.configure(
      config.candidateListData,
      config.customGroups,
    );

    const mandateCalculator = new MandateCalculator();
    const districtVoteTransformer = new DistrictVoteTransformer(
      voterEnvironment,
    );
    const resultModifier = new ResultModifier(
      new UnionSwingTransformer(),
      new VoteShareTransformer(voterEnvironment),
      districtVoteTransformer,
    );
    const pollsterEngine = new PollsterEngine(mandateCalculator);
    pollsterEngine.configure(config.customPollsters);
    const politicalConfig =
      config.playableSides?.[sideId]?.[candidateId]?.politicalConfig ??
      config.politicalConfig;
    const candidateConfig = config.playableSides?.[sideId]?.[candidateId];

    return {
      engine: new CampaignEngine(
        config.candidateListData,
        candidateConfig?.questions ?? [],
        candidateConfig?.answerEffect ?? [],
        resultModifier,
        new EffectApplier(mandateCalculator, districtGroupEngine),
        mandateCalculator,
        pollsterEngine,
        new MayoralResultCalculator(),
        new CampaignEventEngine(),
        new CandidateWithdrawalTransformer(),
        config.partyListData,
        candidateConfig?.advisorFeedback,
        candidateConfig?.campaignEvents ?? config.campaignEvents,
        politicalConfig?.relations,
        politicalConfig,
      ),
    };
  }

  return {
    async listCampaigns() {
      return buildCampaignCatalog(campaignsDir).map((campaign) => {
        const manifest = getManifest(campaign.route);
        return {
          ...campaign,
          sides: Object.entries(manifest.files.playableSides ?? {}).map(
            ([sideId, candidates]) => ({
              sideId,
              candidates: Object.keys(candidates),
            }),
          ),
        };
      });
    },

    async inspectCampaignQuestion(
      campaignId: string,
      sideId: string,
      candidateId: string,
      questionId?: string,
    ) {
      const { campaign, manifest } = loadRuntimeCampaign(
        campaignId,
        sideId,
        candidateId,
      );
      const paths = manifest.files.playableSides?.[sideId]?.[candidateId];
      if (!paths?.questions) {
        throw new Error(
          `No questions are configured for ${sideId}/${candidateId}`,
        );
      }

      const questions = readCampaignJson<RawQuestion[]>(
        campaign.route,
        paths.questions,
      );
      if (!questionId) {
        return questions.map((question) => ({
          id: question.id,
          title: question.title,
          question: question.question,
          possibleAnswers: question.possibleAnswers,
        }));
      }

      const question = questions.find((item) => item.id === questionId);
      if (!question) throw new Error(`Unknown question ID: ${questionId}`);
      const answerEffects = paths.answerEffect
        ? readCampaignJson<
            Array<{
              id: string;
              answers: Array<{
                id: string;
                effects: unknown[];
                conditionalEffects?: unknown[];
              }>;
            }>
          >(campaign.route, paths.answerEffect)
        : [];
      const effectRow = answerEffects.find((row) => row.id === questionId);

      return {
        campaignId,
        sideId,
        candidateId,
        question,
        answers: question.possibleAnswers.map((answer) => ({
          ...answer,
          ...(effectRow?.answers.find((effect) => effect.id === answer.id) ?? {
            effects: [],
          }),
        })),
      };
    },

    async validateCampaign(campaignId: string) {
      const campaign = getCampaign(campaignId);
      const header: CampaignHeaderInput = {
        id: campaign.id,
        route: campaign.route,
        campaignBanner: campaign.campaignBanner,
        thinCampaignBanner: campaign.thinCampaignBanner,
      };
      const diagnostics: Diagnostic[] = validateCampaign(header, getSource());
      return {
        campaignId,
        errorCount: diagnostics.filter((item) => item.severity === "error")
          .length,
        warningCount: diagnostics.filter((item) => item.severity === "warning")
          .length,
        diagnostics,
      };
    },

    async simulateCampaign(input: SimulationInput) {
      const { config } = loadRuntimeCampaign(
        input.campaignId,
        input.sideId,
        input.candidateId,
      );
      const requestedRuns = input.runs ?? 100;
      const runs = Math.min(5000, Math.max(1, Math.floor(requestedRuns)));
      const requestedSeed = input.seed ?? 1;
      const seed = requestedSeed >>> 0;
      const mode = input.mode ?? "random";
      const random = createSeededRandom(seed);
      const totals: Record<
        string,
        {
          seats: number[];
          listSeats: number[];
          constituencySeats: number[];
          candidateListVoteShare: number[];
          partyListVoteShare: number[];
          wins: number;
        }
      > = {};
      const originalRandom = Math.random;
      Math.random = random;

      try {
        for (let run = 0; run < runs; run += 1) {
          const { engine } = createEngine(
            config,
            input.sideId,
            input.candidateId,
          );
          let state: CampaignState = {
            ...engine.createInitialState(
              input.campaignId,
              null,
              config.electionConfig,
              input.sideId,
              config.version,
            ),
            playerSide: {
              partyId: input.sideId,
              candidateId: input.candidateId,
            },
          };
          const gameSettings: GameSettings = {
            showAdvisorFeedback: false,
            language: "hu",
          };
          const campaignStrategies =
            config.playableSides?.[input.sideId]?.[input.candidateId]
              ?.campaignStrategies;
          const history: HistoryItem[] = [];

          while (!state.isEnded && state.currentQuestion) {
            const question = state.currentQuestion;
            const answerId = selectAnswer(
              question,
              input.answerPlan,
              mode,
              random,
            );
            if (!answerId) {
              throw new Error(
                `No answer to select for question "${question.id}"`,
              );
            }
            const answer = state.answerEffects?.find(
              (item) => item.id === answerId,
            );
            if (answerId === undefined || !answer) {
              throw new Error(
                `No answer effects found for question "${question.id}" answerId "${answerId}"`,
              );
            }

            state = engine.processTurn(
              state,
              {
                questionId: question.id,
                answerId: answer.id,
                effects: answer.effects,
                conditionalEffects: answer.conditionalEffects,
                selectedDistrict: null,
              },
              history,
              gameSettings,
              config.electionConfig,
              campaignStrategies,
              config.electionConfig.districtBoost,
              getPlayerVoteKey(config.electionConfig, {
                partyId: input.sideId,
                candidateId: input.candidateId,
              }),
            );
            history.push({
              questionId: question.id,
              answerId: answer.id,
              visitedDistrict: {} as HistoryItem["visitedDistrict"],
              turn: state.turn,
              results: state.results!,
            });
          }

          const results = state.results;
          const mandates = results?.mandates ?? [];
          const topSeats = Math.max(
            0,
            ...mandates.map((mandate) => mandate.totalSeats),
          );
          const winners = mandates.filter(
            (mandate) => mandate.totalSeats === topSeats,
          );

          for (const mandate of mandates) {
            const party = (totals[mandate.party] ??= {
              seats: [],
              listSeats: [],
              constituencySeats: [],
              candidateListVoteShare: [],
              partyListVoteShare: [],
              wins: 0,
            });
            party.seats.push(mandate.totalSeats);
            party.listSeats.push(mandate.listSeats);
            party.constituencySeats.push(mandate.constituencySeats);
            party.candidateListVoteShare.push(
              results?.percentages.candidateListResults[mandate.party] ?? 0,
            );
            party.partyListVoteShare.push(
              results?.percentages.partyListResults[mandate.party] ?? 0,
            );
            if (winners.includes(mandate)) party.wins += 1 / winners.length;
          }
        }
      } finally {
        Math.random = originalRandom;
      }

      return {
        campaignId: input.campaignId,
        sideId: input.sideId,
        candidateId: input.candidateId,
        runs,
        seed,
        mode,
        parties: Object.fromEntries(
          Object.entries(totals).map(([partyId, result]) => [
            partyId,
            {
              averageTotalSeats: average(result.seats),
              minTotalSeats: Math.min(...result.seats),
              maxTotalSeats: Math.max(...result.seats),
              averageListSeats: average(result.listSeats),
              averageConstituencySeats: average(result.constituencySeats),
              averageCandidateListVoteShare: average(
                result.candidateListVoteShare,
              ),
              averagePartyListVoteShare: average(result.partyListVoteShare),
              winShare: result.wins / runs,
            },
          ]),
        ),
      };
    },
  };
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

function safePath(root: string, ...parts: string[]) {
  const resolvedRoot = path.resolve(root);
  const resolvedPath = path.resolve(resolvedRoot, ...parts);
  if (
    resolvedPath !== resolvedRoot &&
    !resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)
  ) {
    throw new Error("Path must stay inside the campaign data directory");
  }
  return resolvedPath;
}

function average(values: number[]) {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
}

function selectAnswer(
  question: RawQuestion,
  answerPlan: Record<string, string> | undefined,
  mode: SimulationMode,
  random: () => number,
) {
  const plannedAnswer = answerPlan?.[question.id];
  if (plannedAnswer) return plannedAnswer;

  const answers = question.possibleAnswers;
  if (mode === "last") return answers.at(-1)?.id;
  if (mode === "random") {
    return answers[Math.floor(random() * answers.length)]?.id;
  }
  return answers[0]?.id;
}

function createSeededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

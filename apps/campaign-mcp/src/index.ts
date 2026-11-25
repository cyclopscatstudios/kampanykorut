import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createServer } from "vite";
import { format } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod/v4";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(packageDir, "../..");
const appDir = path.join(repositoryRoot, "apps/kampanykorut");
const publicDir = path.join(appDir, "public");

for (const method of ["debug", "info", "log", "warn", "error"] as const) {
  console[method] = (...args: unknown[]) => {
    process.stderr.write(`${format(...args)}\n`);
  };
}

const vite = await createServer({
  configFile: path.join(appDir, "vite.config.ts"),
  appType: "custom",
  server: { middlewareMode: true },
});

try {
  const { createCampaignMcpAdapter } = await vite.ssrLoadModule(
    "/src/testing/campaignMcpAdapter.ts",
  );
  const adapter = createCampaignMcpAdapter(publicDir);
  const server = new McpServer({
    name: "kampanykorut",
    version: "0.1.0",
  });

  server.registerTool(
    "list_campaigns",
    {
      description:
        "List Kampánykörút campaigns with their IDs, status, sides, and candidates.",
      inputSchema: {},
    },
    async () => textResult(await adapter.listCampaigns()),
  );

  server.registerTool(
    "inspect_campaign_question",
    {
      description:
        "Read a campaign's questions and answer effects for one playable side and candidate. Omit questionId to list all questions for that candidate.",
      inputSchema: {
        campaignId: z.string().min(1),
        sideId: z.string().min(1),
        candidateId: z.string().min(1),
        questionId: z.string().min(1).optional(),
      },
    },
    async ({ campaignId, sideId, candidateId, questionId }) =>
      textResult(
        await adapter.inspectCampaignQuestion(
          campaignId,
          sideId,
          candidateId,
          questionId,
        ),
      ),
  );

  server.registerTool(
    "validate_campaign",
    {
      description:
        "Run the repository's campaign-data validator for one shipped campaign and return errors and warnings.",
      inputSchema: { campaignId: z.string().min(1) },
    },
    async ({ campaignId }) =>
      textResult(await adapter.validateCampaign(campaignId)),
  );

  server.registerTool(
    "simulate_campaign",
    {
      description:
        "Run a campaign through the real domain engine without opening a browser or changing a saved game. Returns per-party vote and seat summaries. Random choices are uniform, not a model of human players.",
      inputSchema: {
        campaignId: z.string().min(1),
        sideId: z.string().min(1),
        candidateId: z.string().min(1),
        runs: z.number().int().min(1).max(5000).optional(),
        seed: z.number().int().optional(),
        mode: z.enum(["first", "last", "random"]).optional(),
        answerPlan: z.record(z.string(), z.string()).optional(),
      },
    },
    async (input) => textResult(await adapter.simulateCampaign(input)),
  );

  await serveStdio(server);
} finally {
  await vite.close();
}

function textResult(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
  };
}

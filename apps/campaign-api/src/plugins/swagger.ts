import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import fp from "fastify-plugin";

export const DOCS_PREFIX = "/api/v1/docs";

export const openApi = fp(
  async (app) => {
    await app.register(swagger, {
      openapi: {
        openapi: "3.1.0",
        info: {
          title: "Kampánykörút API",
          description:
            "Campaign storage, review and publishing service for Kampánykörút.",
          version: app.config.gitCommit,
        },
      },
    });

    await app.register(swaggerUi, { routePrefix: DOCS_PREFIX });
  },
  { name: "openapi" },
);

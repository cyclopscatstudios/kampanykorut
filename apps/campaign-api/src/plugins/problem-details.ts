import { STATUS_CODES } from "node:http";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance: string;
  requestId: string;
  errors?: { path: string; message: string }[];
}

function sendProblem(
  request: FastifyRequest,
  reply: FastifyReply,
  problem: Pick<ProblemDetails, "status" | "detail" | "errors">,
) {
  const body: ProblemDetails = {
    type: "about:blank",
    title: STATUS_CODES[problem.status] ?? "Error",
    instance: request.url,
    requestId: request.id,
    ...problem,
  };

  return reply
    .status(problem.status)
    .type("application/problem+json")
    .send(body);
}

export const problemDetails = fp(
  async (app) => {
    app.setErrorHandler((error: FastifyError, request, reply) => {
      if (error.validation) {
        return sendProblem(request, reply, {
          status: 400,
          detail: "Request validation failed",
          errors: error.validation.map((issue) => ({
            path: issue.instancePath || "/",
            message: issue.message ?? "Invalid value",
          })),
        });
      }

      const status =
        error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;

      if (status >= 500) {
        request.log.error({ err: error }, "Unhandled error");
      }

      return sendProblem(request, reply, {
        status,
        detail: status >= 500 ? undefined : error.message,
      });
    });

    app.setNotFoundHandler((request, reply) =>
      sendProblem(request, reply, {
        status: 404,
        detail: `Route ${request.method} ${request.url} not found`,
      }),
    );
  },
  { name: "problem-details" },
);

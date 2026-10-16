import fp from "fastify-plugin";
import mongoose, { type Connection } from "mongoose";

declare module "fastify" {
  interface FastifyInstance {
    mongo: Connection;
  }
}

export const mongo = fp<{ uri: string }>(
  async (app, { uri }) => {
    const connection = await mongoose
      .createConnection(uri, { serverSelectionTimeoutMS: 5000 })
      .asPromise();

    app.decorate("mongo", connection);

    app.addReadinessCheck("mongo", async () => {
      await connection.db!.admin().ping();
    });

    app.addHook("onClose", async () => {
      await connection.close();
    });
  },
  { name: "mongo", dependencies: ["health"] },
);

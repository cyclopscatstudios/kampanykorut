import "reflect-metadata";
import { buildApp } from "./app";
import { loadConfig } from "./config/env";

const config = loadConfig();
const app = await buildApp(config);

let shuttingDown = false;

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, async () => {
    if (shuttingDown) return;
    shuttingDown = true;

    app.log.info({ signal }, "Shutting down");

    try {
      await app.close();
      process.exit(0);
    } catch (err) {
      app.log.error({ err }, "Error during shutdown");
      process.exit(1);
    }
  });
}

try {
  await app.listen({ host: config.host, port: config.port });
} catch (err) {
  app.log.fatal({ err }, "Failed to start server");
  process.exit(1);
}

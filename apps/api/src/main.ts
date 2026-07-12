import { loadConfig } from "./bootstrap/config.js";
import { createApp } from "./http/app.js";
import { MongoDatabase } from "./infrastructure/mongodb.js";

const config = loadConfig();
const database = new MongoDatabase(config.MONGODB_URI, config.MONGODB_DATABASE);
const app = createApp({ database, logger: { level: config.LOG_LEVEL } });

let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  app.log.info({ signal }, "Shutting down API");
  await app.close();
  await database.close();
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await app.listen({ host: config.API_HOST, port: config.API_PORT });
} catch (error) {
  app.log.fatal({ err: error }, "Failed to start API");
  await database.close();
  process.exitCode = 1;
}

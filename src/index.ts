import express from "express";
import dotenv from "dotenv";

import { runMigrations } from "./migrations";
import { router } from "./router";

dotenv.config();

const PORT = process.env.API_PORT ? +process.env.API_PORT : 8080;

async function bootstrapApi(port: number) {
  const app = express();

  app.use(express.json());
  app.use(router);
  app.listen(port, () => {
    console.log(`Api is running on http://localhost:${port}`);
  });
}

(async () => {
  try {
    await bootstrapApi(PORT);
    await runMigrations();
  } catch (error) {
    console.error(error);
  }
})();

process.on("SIGTERM", () => {
  process.exit(0);
});

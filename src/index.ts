import express from "express";
import dotenv from "dotenv";
import { runMigrations } from "./migrations";
import { router } from "./router";

dotenv.config();

const PORT = process.env.API_PORT ? +process.env.API_PORT : 8080;

function bootstrapApi(port: number) {
  const app = express();

  app.use(express.json());
  app.use(router);
  app.listen(port, () => {
    console.log(`Api is running on http://localhost:${port}`);
  });
}

runMigrations();
bootstrapApi(PORT);

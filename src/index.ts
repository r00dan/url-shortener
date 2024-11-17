import express from "express";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.API_PORT ? +process.env.API_PORT : 8080;

function bootstrapApi(port: number) {
  const app = express();

  app.use(express.json());
  app.listen(port, () => {
    console.log(`Api is running on http://localhost:${port}`);
  });
}

bootstrapApi(PORT);

import { Router, Request, Response } from "express";
import { nanoid } from "nanoid";

import { sql } from "./database";
import {
  CreateShortUrlDto,
  createShortUrlDtoValidation,
} from "./create-url.dto";
import { UrlModel } from "./types";
import { Cache } from "./cache";

export const router = Router();
const cacheKeyTemplate = "short-";

const validateBody = (req: Request, res: Response) => {
  if (!req.body) {
    const errorMessage = "Invalid input data. Body cannot be empty.";

    res.status(422).json({ message: errorMessage });

    throw new Error(errorMessage);
  }
};

const validateDto = (req: Request, res: Response) => {
  const dto = req.body;
  const { error } = createShortUrlDtoValidation.validate(dto);

  if (error) {
    res.status(422).json({
      message: `Invalid input data. ${error.message}`,
    });
  }
};

const createShortUrl = (url: string): UrlModel => {
  return {
    id: nanoid(10),
    original_url: url,
  };
};

const sendToPostgres = async (urlModel: UrlModel) => {
  await sql`
        INSERT INTO urls (id, original_url) VALUES (${urlModel.id}, ${urlModel.original_url});
      `;
};

const sendToRedis = async (urlModel: UrlModel) => {
  const { redis } = Cache.getInstance();

  await redis.set(`${cacheKeyTemplate}${urlModel.id}`, urlModel.original_url);
};

router.get("/:id", async (req, res) => {
  try {
    res.status(200).json({ message: req.params.id });
  } catch (error) {}
});

router.post(
  "/create",
  async (req: Request<any, any, CreateShortUrlDto>, res) => {
    try {
      validateBody(req, res);
      validateDto(req, res);

      const dto = req.body;
      const urlModel = createShortUrl(dto.url);

      sendToRedis(urlModel);
      sendToPostgres(urlModel);

      res.status(200).json({
        result: `http://localhost:${process.env.API_PORT}/${urlModel.id}`,
      });
    } catch (error) {
      console.error(error);
    }
  }
);

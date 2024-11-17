import { Router, Request, Response } from "express";
import { nanoid } from "nanoid";

import { sql } from "./database";
import {
  CreateShortUrlDto,
  createShortUrlDtoValidation,
} from "./create-url.dto";
import { NatsSubjects, UrlModel } from "./types";
import { Cache } from "./cache";
import { natsConnection } from "./queue";
import { NatsConnection } from "nats";

export const router = Router();
export const cacheKeyTemplate = "short-";
let nats: NatsConnection | null = null;

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
  const errorMessage = `Invalid input data. ${error?.message ?? ""}`;

  if (error) {
    res.status(422).json({
      message: errorMessage,
    });

    throw new Error(errorMessage);
  }
};

const createShortUrl = (url: string): UrlModel => {
  return {
    id: nanoid(10),
    original_url: url,
  };
};

const getFromPostgres = async (id: string) => {
  return await sql`SELECT * FROM urls WHERE id=${id} LIMIT 1;`;
};

const getFromRedis = async (id: string) => {
  const { redis } = Cache.getInstance();
  const cacheKey = `${cacheKeyTemplate}${id}`;

  return await redis.get(cacheKey);
};

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const cachedData = await getFromRedis(id);

    if (!!cachedData) {
      return res.redirect(cachedData);
    }

    const urlModel = await getFromPostgres(id);

    if (!!urlModel) {
      return res.redirect(urlModel[0].original_url);
    }
  } catch (error) {
    console.error(error);
  }
});

router.post(
  "/create",
  async (req: Request<any, any, CreateShortUrlDto>, res) => {
    try {
      validateBody(req, res);
      validateDto(req, res);

      const dto = req.body;
      const urlModel = createShortUrl(dto.url);

      if (!nats) {
        nats = await natsConnection();
      }

      nats.publish(NatsSubjects.SHORTIFY, JSON.stringify(urlModel));

      res.status(200).json({
        result: `http://localhost:${process.env.API_PORT}/${urlModel.id}`,
      });
    } catch (error) {
      console.error(error);
    }
  }
);

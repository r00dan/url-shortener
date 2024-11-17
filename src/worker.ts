import { StringCodec } from "nats";

import { Cache } from "./cache";
import { NatsSubjects, UrlModel } from "./types";
import { cacheKeyTemplate } from "./router";
import { sql } from "./database";
import { natsConnection } from "./queue";

const sendToRedis = async (urlModel: UrlModel) => {
  const { redis } = Cache.getInstance();
  const cacheKey = `${cacheKeyTemplate}${urlModel.id}`;

  await redis.set(cacheKey, urlModel.original_url);
};

const sendToPostgres = async (urlModel: UrlModel) => {
  await sql`
        INSERT INTO urls (id, original_url) VALUES (${urlModel.id}, ${urlModel.original_url});
      `;
};

const processEvent = async (event: any) => {
  await sendToRedis(event);
  await sendToPostgres(event);
};

const startWorker = async () => {
  const codec = StringCodec();
  const nats = await natsConnection();
  const sub = nats.subscribe(NatsSubjects.SHORTIFY);

  console.log(
    `Worker has started with PID: ${process.pid} and listening for "${NatsSubjects.SHORTIFY}" subject.`
  );

  for await (const msg of sub) {
    try {
      const event = JSON.parse(codec.decode(msg.data));
      console.log(`Received message: ${JSON.stringify(event)}`);

      processEvent(event);
    } catch (error) {
      console.error("Error processing event:", error);
    }
  }
};

process.on("SIGTERM", () => {
  process.exit(0);
});

startWorker().catch((error) => {
  console.error("Error starting worker:", error);
  process.exit(1);
});

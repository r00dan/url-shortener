import { ConnectionOptions, connect } from "nats";

const natsConfig: ConnectionOptions = {
  servers: `nats://${process.env.NATS_HOST}:${process.env.NATS_PORT}`,
};

export const natsConnection = async () => {
  try {
    return await connect(natsConfig);
  } catch (error) {
    console.error("Error connection to NATS:", error);
  }
};

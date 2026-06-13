import Fastify from "fastify";
import cors from "@fastify/cors";
import { getTips, getTipsByAddress, getTipCount, getLastProcessedBlock } from "./db";
import { config } from "./config";

export async function startApi(): Promise<void> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: "*" });

  app.get("/tips", async (_req, reply) => {
    const tips = await getTips();
    return reply.send(tips);
  });

  app.get<{ Params: { address: string } }>(
    "/tips/:address",
    async (req, reply) => {
      const tips = await getTipsByAddress(req.params.address);
      return reply.send(tips);
    }
  );

  app.get("/status", async (_req, reply) => {
    const [lastBlock, tipCount] = await Promise.all([
      getLastProcessedBlock(),
      getTipCount(),
    ]);
    return reply.send({ lastBlock, tipCount });
  });

  app.get("/health", async (_req, reply) => {
    return reply.send({ ok: true });
  });

  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`[api] listening on port ${config.port}`);
}

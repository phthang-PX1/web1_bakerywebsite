import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

export const redis = new Redis(env.REDIS_URL, {
  connectTimeout: 5000,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 3000);
    logger.warn(`Redis reconnecting... attempt ${times}, delay ${delay}ms`);
    return delay;
  },
  reconnectOnError(err) {
    if (err.message.includes("READONLY")) {
      return true;
    }
    return false;
  }
});

redis.on("connect", () => {
  logger.info("Redis connected successfully");
});

redis.on("error", (error) => {
  logger.error("Redis connection error", { error: error.message });
});

export const checkRedisHealth = async (): Promise<{ status: "ok" | "error"; latencyMs?: number; message?: string }> => {
  const start = Date.now();
  try {
    const res = await redis.ping();
    if (res !== "PONG") {
      throw new Error(`Unexpected ping response: ${res}`);
    }
    const latencyMs = Date.now() - start;
    return { status: "ok", latencyMs };
  } catch (error) {
    logger.error("Redis health check failed", { error: error instanceof Error ? error.message : String(error) });
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Redis ping failed"
    };
  }
};

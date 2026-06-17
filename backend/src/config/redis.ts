import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis(env.REDIS_URL, {
  connectTimeout: 5000,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    return times > 3 ? null : Math.min(times * 200, 1000);
  }
});

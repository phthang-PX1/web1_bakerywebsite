import { PrismaClient } from "@prisma/client";
import { env } from "./env";

export const prisma = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});

export const checkDbHealth = async (): Promise<{ status: "ok" | "error"; latencyMs?: number; message?: string }> => {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;
    return { status: "ok", latencyMs };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Database connection failed"
    };
  }
};

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  FRONTEND_URL: z.string().default("http://localhost:4200"),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_ACCESS_SECRET_FALLBACK: z.string().min(32).optional(),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET_FALLBACK: z.string().min(32).optional(),
  JWT_ACCESS_EXPIRES_IN: z.string().default("1h"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  EMAIL_HOST: z.string().min(1),
  EMAIL_PORT: z.coerce.number().int().positive().default(587),
  EMAIL_USER: z.string().email(),
  EMAIL_PASS: z.string().min(1),
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_PHONE_NUMBER: z.string().min(1),
  STATIC_QR_URL: z.string().url(),
  PAYMENT_WEBHOOK_SECRET: z.string().min(16).optional(),
  INTERNAL_API_KEY: z.string().min(16).optional()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables", parsedEnv.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;

export const allowedOrigins = Array.from(
  new Set(["http://localhost:4200", ...env.FRONTEND_URL.split(",").map((origin) => origin.trim()).filter(Boolean)])
);

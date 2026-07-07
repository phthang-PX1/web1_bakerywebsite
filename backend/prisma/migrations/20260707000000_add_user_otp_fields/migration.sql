ALTER TABLE "users"
ADD COLUMN "otp_hash" VARCHAR(255),
ADD COLUMN "otp_expires_at" TIMESTAMP(3);

CREATE TABLE "auth_action_tokens" (
    "token_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "purpose" VARCHAR(32) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_action_tokens_pkey" PRIMARY KEY ("token_id")
);

CREATE UNIQUE INDEX "auth_action_tokens_token_hash_key" ON "auth_action_tokens"("token_hash");
CREATE INDEX "auth_action_tokens_user_id_purpose_idx" ON "auth_action_tokens"("user_id", "purpose");
CREATE INDEX "auth_action_tokens_expires_at_idx" ON "auth_action_tokens"("expires_at");

ALTER TABLE "auth_action_tokens"
ADD CONSTRAINT "auth_action_tokens_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

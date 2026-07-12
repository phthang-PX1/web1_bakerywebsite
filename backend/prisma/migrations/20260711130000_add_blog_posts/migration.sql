-- CreateTable
CREATE TABLE "blog_posts" (
    "post_id" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "excerpt" VARCHAR(500) NOT NULL,
    "cover_image" VARCHAR(500) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "reading_time" VARCHAR(50) NOT NULL,
    "content" TEXT[],
    "gallery_images" TEXT[],
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("post_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_is_active_published_at_idx" ON "blog_posts"("is_active", "published_at");

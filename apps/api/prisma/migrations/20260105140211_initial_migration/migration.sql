-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "channels" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "description" TEXT,
    "banner_url" TEXT,
    "avatar_url" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "channels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail_url" TEXT,
    "video_url" TEXT,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "dislike_count" INTEGER NOT NULL DEFAULT 0,
    "channel_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "published_at" DATETIME,
    CONSTRAINT "videos_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "video_likes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "video_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "video_likes_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "subscriptions_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transcode_jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "video_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "transcode_jobs_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "channels_handle_key" ON "channels"("handle");

-- CreateIndex
CREATE INDEX "channels_user_id_idx" ON "channels"("user_id");

-- CreateIndex
CREATE INDEX "videos_channel_id_idx" ON "videos"("channel_id");

-- CreateIndex
CREATE INDEX "videos_status_visibility_idx" ON "videos"("status", "visibility");

-- CreateIndex
CREATE INDEX "videos_created_at_idx" ON "videos"("created_at");

-- CreateIndex
CREATE INDEX "comments_video_id_idx" ON "comments"("video_id");

-- CreateIndex
CREATE INDEX "comments_parent_id_idx" ON "comments"("parent_id");

-- CreateIndex
CREATE INDEX "video_likes_video_id_idx" ON "video_likes"("video_id");

-- CreateIndex
CREATE UNIQUE INDEX "video_likes_user_id_video_id_key" ON "video_likes"("user_id", "video_id");

-- CreateIndex
CREATE INDEX "subscriptions_channel_id_idx" ON "subscriptions"("channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_channel_id_key" ON "subscriptions"("user_id", "channel_id");

-- CreateIndex
CREATE INDEX "transcode_jobs_video_id_idx" ON "transcode_jobs"("video_id");

-- CreateIndex
CREATE INDEX "transcode_jobs_status_idx" ON "transcode_jobs"("status");

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_videos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail_url" TEXT,
    "video_url" TEXT,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "moderation" TEXT NOT NULL DEFAULT 'pending',
    "moderation_score" REAL,
    "moderation_reason" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "dislike_count" INTEGER NOT NULL DEFAULT 0,
    "channel_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "published_at" DATETIME,
    CONSTRAINT "videos_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_videos" ("channel_id", "created_at", "description", "dislike_count", "duration", "id", "like_count", "published_at", "status", "thumbnail_url", "title", "updated_at", "video_url", "view_count", "visibility") SELECT "channel_id", "created_at", "description", "dislike_count", "duration", "id", "like_count", "published_at", "status", "thumbnail_url", "title", "updated_at", "video_url", "view_count", "visibility" FROM "videos";
DROP TABLE "videos";
ALTER TABLE "new_videos" RENAME TO "videos";
CREATE INDEX "videos_channel_id_idx" ON "videos"("channel_id");
CREATE INDEX "videos_status_visibility_idx" ON "videos"("status", "visibility");
CREATE INDEX "videos_created_at_idx" ON "videos"("created_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

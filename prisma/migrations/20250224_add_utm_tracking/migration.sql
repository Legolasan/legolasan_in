-- AlterTable: Add UTM tracking columns to page_views
ALTER TABLE "page_views" ADD COLUMN "utmSource" VARCHAR(100);
ALTER TABLE "page_views" ADD COLUMN "utmMedium" VARCHAR(100);
ALTER TABLE "page_views" ADD COLUMN "utmCampaign" VARCHAR(200);
ALTER TABLE "page_views" ADD COLUMN "utmContent" VARCHAR(200);

-- CreateIndex: Index for fast UTM source aggregation
CREATE INDEX "page_views_utmSource_idx" ON "page_views"("utmSource");

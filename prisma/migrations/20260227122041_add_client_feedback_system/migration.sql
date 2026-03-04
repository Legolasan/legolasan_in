-- CreateTable
CREATE TABLE "client_projects" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "githubRepo" VARCHAR(500),
    "vercelUrl" VARCHAR(500),
    "customDomain" VARCHAR(200),
    "accessToken" TEXT NOT NULL,
    "accessEnabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_feedback" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "pageUrl" VARCHAR(1000) NOT NULL,
    "pagePath" VARCHAR(500) NOT NULL,
    "elementSelector" VARCHAR(500),
    "elementText" TEXT,
    "elementHtml" TEXT,
    "screenshotData" TEXT,
    "positionX" INTEGER,
    "positionY" INTEGER,
    "viewportWidth" INTEGER,
    "viewportHeight" INTEGER,
    "clientName" VARCHAR(100),
    "clientEmail" VARCHAR(200),
    "ipAddress" VARCHAR(100),
    "userAgent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT DEFAULT 'normal',
    "category" VARCHAR(100),
    "adminNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_projects_slug_key" ON "client_projects"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "client_projects_accessToken_key" ON "client_projects"("accessToken");

-- CreateIndex
CREATE INDEX "client_projects_slug_idx" ON "client_projects"("slug");

-- CreateIndex
CREATE INDEX "client_projects_status_idx" ON "client_projects"("status");

-- CreateIndex
CREATE INDEX "client_feedback_projectId_idx" ON "client_feedback"("projectId");

-- CreateIndex
CREATE INDEX "client_feedback_status_idx" ON "client_feedback"("status");

-- CreateIndex
CREATE INDEX "client_feedback_pagePath_idx" ON "client_feedback"("pagePath");

-- CreateIndex
CREATE INDEX "client_feedback_createdAt_idx" ON "client_feedback"("createdAt");

-- AddForeignKey
ALTER TABLE "client_feedback" ADD CONSTRAINT "client_feedback_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "client_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

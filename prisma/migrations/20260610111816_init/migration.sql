-- CreateTable
CREATE TABLE "Council" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "website" TEXT,
    "libraryUrl" TEXT,
    "libraryPlatform" TEXT,
    "population" INTEGER,
    "areaSqKm" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Council_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouncilStats" (
    "id" TEXT NOT NULL,
    "councilId" TEXT NOT NULL,
    "malePercent" DOUBLE PRECISION,
    "femalePercent" DOUBLE PRECISION,
    "medianAge" INTEGER,
    "agePct0to4" DOUBLE PRECISION,
    "agePct5to14" DOUBLE PRECISION,
    "agePct15to19" DOUBLE PRECISION,
    "agePct20to39" DOUBLE PRECISION,
    "agePct40to64" DOUBLE PRECISION,
    "agePct65plus" DOUBLE PRECISION,
    "dataYear" INTEGER NOT NULL DEFAULT 2021,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouncilStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Library" (
    "id" TEXT NOT NULL,
    "councilId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "suburb" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,

    CONSTRAINT "Library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "councilId" TEXT NOT NULL,
    "libraryId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "venue" TEXT,
    "bookingUrl" TEXT,
    "source" TEXT NOT NULL,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeLog" (
    "id" TEXT NOT NULL,
    "councilId" TEXT,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "count" INTEGER,
    "error" TEXT,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrapeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CouncilStats_councilId_key" ON "CouncilStats"("councilId");

-- CreateIndex
CREATE INDEX "Event_councilId_startAt_idx" ON "Event"("councilId", "startAt");

-- CreateIndex
CREATE INDEX "Event_category_startAt_idx" ON "Event"("category", "startAt");

-- CreateIndex
CREATE UNIQUE INDEX "Event_source_externalId_key" ON "Event"("source", "externalId");

-- AddForeignKey
ALTER TABLE "CouncilStats" ADD CONSTRAINT "CouncilStats_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "Council"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Library" ADD CONSTRAINT "Library_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "Council"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "Council"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library"("id") ON DELETE SET NULL ON UPDATE CASCADE;

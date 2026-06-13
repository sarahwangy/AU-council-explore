-- CreateTable
CREATE TABLE "Childcare" (
    "id" TEXT NOT NULL,
    "acecqaId" TEXT,
    "name" TEXT NOT NULL,
    "providerName" TEXT,
    "serviceType" TEXT,
    "address" TEXT,
    "suburb" TEXT,
    "postcode" TEXT,
    "state" TEXT NOT NULL DEFAULT 'VIC',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "qualityRating" TEXT,
    "operatingDays" TEXT,
    "operatingHours" TEXT,
    "vacancyStatus" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Childcare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playground" (
    "id" TEXT NOT NULL,
    "osmId" TEXT,
    "name" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "suburb" TEXT,
    "state" TEXT NOT NULL DEFAULT 'VIC',
    "fenced" BOOLEAN,
    "shaded" BOOLEAN,
    "hasBbq" BOOLEAN,
    "hasToilet" BOOLEAN,
    "hasSwings" BOOLEAN,
    "surfaceType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Playground_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hospital" (
    "id" TEXT NOT NULL,
    "osmId" TEXT,
    "name" TEXT NOT NULL,
    "hospitalType" TEXT,
    "address" TEXT,
    "suburb" TEXT,
    "state" TEXT NOT NULL DEFAULT 'VIC',
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "emergencyAvailable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Childcare_acecqaId_key" ON "Childcare"("acecqaId");

-- CreateIndex
CREATE INDEX "Childcare_state_suburb_idx" ON "Childcare"("state", "suburb");

-- CreateIndex
CREATE INDEX "Childcare_lat_lng_idx" ON "Childcare"("lat", "lng");

-- CreateIndex
CREATE UNIQUE INDEX "Playground_osmId_key" ON "Playground"("osmId");

-- CreateIndex
CREATE INDEX "Playground_state_idx" ON "Playground"("state");

-- CreateIndex
CREATE INDEX "Playground_lat_lng_idx" ON "Playground"("lat", "lng");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_osmId_key" ON "Hospital"("osmId");

-- CreateIndex
CREATE INDEX "Hospital_state_idx" ON "Hospital"("state");

-- CreateIndex
CREATE INDEX "Hospital_lat_lng_idx" ON "Hospital"("lat", "lng");

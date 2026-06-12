-- CreateTable
CREATE TABLE "AiSearchCache" (
    "id" TEXT NOT NULL,
    "queryKey" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSearchCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiSearchCache_queryKey_key" ON "AiSearchCache"("queryKey");

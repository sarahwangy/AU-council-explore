-- AlterTable
ALTER TABLE "Council" ADD COLUMN     "hardRubbishUrl" TEXT,
ADD COLUMN     "kindergartenUrl" TEXT,
ADD COLUMN     "libraryCardUrl" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "ageGroup" TEXT,
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "requiresBooking" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Library" ADD COLUMN     "hoursJson" TEXT;

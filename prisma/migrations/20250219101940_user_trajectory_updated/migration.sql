-- AlterTable
ALTER TABLE "UserTrajectory" ADD COLUMN     "accuracy" DOUBLE PRECISION,
ADD COLUMN     "altitude" DOUBLE PRECISION,
ADD COLUMN     "altitudeAccuracy" DOUBLE PRECISION,
ADD COLUMN     "heading" DOUBLE PRECISION,
ADD COLUMN     "speed" DOUBLE PRECISION;

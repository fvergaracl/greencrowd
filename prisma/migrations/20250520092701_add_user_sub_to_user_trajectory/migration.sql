ALTER TABLE "UserTrajectory" ADD COLUMN "userSub" TEXT;

UPDATE "UserTrajectory" ut
SET "userSub" = u."sub"
FROM "User" u
WHERE ut."userId" = u."id";

ALTER TABLE "UserTrajectory" ALTER COLUMN "userSub" SET NOT NULL;

ALTER TABLE "UserTrajectory"
ADD CONSTRAINT "UserTrajectory_userSub_fkey" FOREIGN KEY ("userSub") REFERENCES "User"("sub") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "UserTrajectory_userSub_idx" ON "UserTrajectory"("userSub");
ALTER TABLE public."UserTrajectory" DROP COLUMN "userId";

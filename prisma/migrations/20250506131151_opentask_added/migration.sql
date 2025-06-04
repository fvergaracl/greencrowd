-- CreateTable
CREATE TABLE "OpenTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "taskData" JSONB NOT NULL,
    "areaId" TEXT NOT NULL,
    "allowedRadius" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "availableFrom" TIMESTAMP(3),
    "availableTo" TIMESTAMP(3),
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpenTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenTaskResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "openTaskId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpenTaskResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OpenTask_areaId_idx" ON "OpenTask"("areaId");

-- CreateIndex
CREATE INDEX "OpenTaskResponse_userId_idx" ON "OpenTaskResponse"("userId");

-- CreateIndex
CREATE INDEX "OpenTaskResponse_openTaskId_idx" ON "OpenTaskResponse"("openTaskId");

-- AddForeignKey
ALTER TABLE "OpenTask" ADD CONSTRAINT "OpenTask_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenTaskResponse" ADD CONSTRAINT "OpenTaskResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenTaskResponse" ADD CONSTRAINT "OpenTaskResponse_openTaskId_fkey" FOREIGN KEY ("openTaskId") REFERENCES "OpenTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

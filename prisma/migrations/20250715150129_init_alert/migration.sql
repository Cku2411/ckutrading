-- CreateEnum
CREATE TYPE "AlertDirection" AS ENUM ('ABOVE', 'BELOW');

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "targetPrice" DOUBLE PRECISION NOT NULL,
    "direction" "AlertDirection" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "triggeredAt" TIMESTAMP(3),

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

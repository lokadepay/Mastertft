-- CreateTable
CREATE TABLE "MtftComposition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "top4Rate" DOUBLE PRECISION,
    "averagePlace" DOUBLE PRECISION,
    "playRate" DOUBLE PRECISION,
    "compDetails" JSONB,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "lastUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MtftComposition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MtftComposition_name_key" ON "MtftComposition"("name");

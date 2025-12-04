/*
  Warnings:

  - You are about to drop the column `compDetails` on the `MtftComposition` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdate` on the `MtftComposition` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `MtftComposition` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `MtftComposition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MtftComposition" DROP COLUMN "compDetails",
DROP COLUMN "lastUpdate",
DROP COLUMN "source",
ADD COLUMN     "augmentPriority" TEXT[],
ADD COLUMN     "compStyleId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "MtftUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "riotApiId" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "health" INTEGER NOT NULL,
    "startMana" INTEGER NOT NULL,
    "maxMana" INTEGER NOT NULL,
    "armor" INTEGER NOT NULL,
    "magicResist" INTEGER NOT NULL,
    "attackDamage" INTEGER NOT NULL,
    "attackSpeed" DOUBLE PRECISION NOT NULL,
    "attackRange" INTEGER NOT NULL,
    "abilityId" TEXT NOT NULL,
    "playRate" DOUBLE PRECISION,
    "top4Rate" DOUBLE PRECISION,
    "averagePlace" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MtftUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MtftAbility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passive" TEXT,
    "active" TEXT NOT NULL,

    CONSTRAINT "MtftAbility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MtftScalingStat" (
    "id" SERIAL NOT NULL,
    "statName" TEXT NOT NULL,
    "statValue" TEXT NOT NULL,
    "abilityId" TEXT NOT NULL,

    CONSTRAINT "MtftScalingStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MtftItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "riotApiId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "stats" JSONB,
    "component1Id" TEXT,
    "component2Id" TEXT,
    "playRate" DOUBLE PRECISION,
    "top4Rate" DOUBLE PRECISION,
    "averagePlace" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MtftItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MtftTrait" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "riotApiId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MtftTrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MtftTraitBreakpoint" (
    "id" TEXT NOT NULL,
    "traitId" TEXT NOT NULL,
    "unitsNeeded" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "effect" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MtftTraitBreakpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MtftAugment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "riotApiId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "availableAt" TEXT[],
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MtftAugment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MtftCompStyle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MtftCompStyle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitTrait" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "traitId" TEXT NOT NULL,

    CONSTRAINT "UnitTrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitRecommendedItem" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,

    CONSTRAINT "UnitRecommendedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitItemStat" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "playRate" DOUBLE PRECISION,
    "top4Rate" DOUBLE PRECISION,
    "averagePlace" DOUBLE PRECISION,

    CONSTRAINT "UnitItemStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemCombinationStat" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "combinedWithId" TEXT NOT NULL,
    "playRate" DOUBLE PRECISION,
    "top4Rate" DOUBLE PRECISION,
    "averagePlace" DOUBLE PRECISION,

    CONSTRAINT "ItemCombinationStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemTraitStat" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "traitId" TEXT NOT NULL,
    "playRate" DOUBLE PRECISION,
    "top4Rate" DOUBLE PRECISION,
    "averagePlace" DOUBLE PRECISION,

    CONSTRAINT "ItemTraitStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompositionFeaturedUnit" (
    "id" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "CompositionFeaturedUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompositionFeaturedTrait" (
    "id" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "traitId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "CompositionFeaturedTrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompositionCoreUnit" (
    "id" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "CompositionCoreUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompositionFlexUnit" (
    "id" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "CompositionFlexUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompositionUnit" (
    "id" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,

    CONSTRAINT "CompositionUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompositionCoreItem" (
    "id" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "CompositionCoreItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompositionPriorityComponent" (
    "id" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "CompositionPriorityComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompositionSpecialItem" (
    "id" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "CompositionSpecialItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompositionAugmentPriority" (
    "id" TEXT NOT NULL,
    "compositionId" TEXT NOT NULL,
    "augmentId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "CompositionAugmentPriority_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MtftUnit_name_key" ON "MtftUnit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MtftUnit_riotApiId_key" ON "MtftUnit"("riotApiId");

-- CreateIndex
CREATE UNIQUE INDEX "MtftUnit_abilityId_key" ON "MtftUnit"("abilityId");

-- CreateIndex
CREATE INDEX "MtftScalingStat_abilityId_idx" ON "MtftScalingStat"("abilityId");

-- CreateIndex
CREATE UNIQUE INDEX "MtftItem_name_key" ON "MtftItem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MtftItem_riotApiId_key" ON "MtftItem"("riotApiId");

-- CreateIndex
CREATE UNIQUE INDEX "MtftTrait_name_key" ON "MtftTrait"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MtftTrait_riotApiId_key" ON "MtftTrait"("riotApiId");

-- CreateIndex
CREATE UNIQUE INDEX "MtftTraitBreakpoint_traitId_unitsNeeded_key" ON "MtftTraitBreakpoint"("traitId", "unitsNeeded");

-- CreateIndex
CREATE UNIQUE INDEX "MtftAugment_name_key" ON "MtftAugment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MtftAugment_riotApiId_key" ON "MtftAugment"("riotApiId");

-- CreateIndex
CREATE UNIQUE INDEX "MtftCompStyle_name_key" ON "MtftCompStyle"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UnitTrait_unitId_traitId_key" ON "UnitTrait"("unitId", "traitId");

-- CreateIndex
CREATE UNIQUE INDEX "UnitRecommendedItem_unitId_itemId_key" ON "UnitRecommendedItem"("unitId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "UnitItemStat_unitId_itemId_key" ON "UnitItemStat"("unitId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemCombinationStat_itemId_combinedWithId_key" ON "ItemCombinationStat"("itemId", "combinedWithId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemTraitStat_itemId_traitId_key" ON "ItemTraitStat"("itemId", "traitId");

-- CreateIndex
CREATE UNIQUE INDEX "CompositionFeaturedUnit_compositionId_displayOrder_key" ON "CompositionFeaturedUnit"("compositionId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CompositionFeaturedUnit_compositionId_unitId_key" ON "CompositionFeaturedUnit"("compositionId", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "CompositionFeaturedTrait_compositionId_displayOrder_key" ON "CompositionFeaturedTrait"("compositionId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CompositionFeaturedTrait_compositionId_traitId_key" ON "CompositionFeaturedTrait"("compositionId", "traitId");

-- CreateIndex
CREATE UNIQUE INDEX "CompositionCoreUnit_compositionId_displayOrder_key" ON "CompositionCoreUnit"("compositionId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CompositionCoreUnit_compositionId_unitId_key" ON "CompositionCoreUnit"("compositionId", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "CompositionFlexUnit_compositionId_displayOrder_key" ON "CompositionFlexUnit"("compositionId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CompositionFlexUnit_compositionId_unitId_key" ON "CompositionFlexUnit"("compositionId", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "CompositionUnit_compositionId_unitId_key" ON "CompositionUnit"("compositionId", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "CompositionCoreItem_compositionId_itemId_key" ON "CompositionCoreItem"("compositionId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "CompositionCoreItem_compositionId_displayOrder_key" ON "CompositionCoreItem"("compositionId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CompositionPriorityComponent_compositionId_itemId_key" ON "CompositionPriorityComponent"("compositionId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "CompositionPriorityComponent_compositionId_displayOrder_key" ON "CompositionPriorityComponent"("compositionId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CompositionSpecialItem_compositionId_itemId_key" ON "CompositionSpecialItem"("compositionId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "CompositionSpecialItem_compositionId_displayOrder_key" ON "CompositionSpecialItem"("compositionId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CompositionAugmentPriority_compositionId_augmentId_key" ON "CompositionAugmentPriority"("compositionId", "augmentId");

-- CreateIndex
CREATE UNIQUE INDEX "CompositionAugmentPriority_compositionId_displayOrder_key" ON "CompositionAugmentPriority"("compositionId", "displayOrder");

-- AddForeignKey
ALTER TABLE "MtftUnit" ADD CONSTRAINT "MtftUnit_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "MtftAbility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MtftScalingStat" ADD CONSTRAINT "MtftScalingStat_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "MtftAbility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MtftItem" ADD CONSTRAINT "MtftItem_component1Id_fkey" FOREIGN KEY ("component1Id") REFERENCES "MtftItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MtftItem" ADD CONSTRAINT "MtftItem_component2Id_fkey" FOREIGN KEY ("component2Id") REFERENCES "MtftItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MtftTraitBreakpoint" ADD CONSTRAINT "MtftTraitBreakpoint_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "MtftTrait"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MtftComposition" ADD CONSTRAINT "MtftComposition_compStyleId_fkey" FOREIGN KEY ("compStyleId") REFERENCES "MtftCompStyle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitTrait" ADD CONSTRAINT "UnitTrait_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MtftUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitTrait" ADD CONSTRAINT "UnitTrait_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "MtftTrait"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitRecommendedItem" ADD CONSTRAINT "UnitRecommendedItem_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MtftUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitRecommendedItem" ADD CONSTRAINT "UnitRecommendedItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MtftItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitItemStat" ADD CONSTRAINT "UnitItemStat_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MtftUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitItemStat" ADD CONSTRAINT "UnitItemStat_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MtftItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCombinationStat" ADD CONSTRAINT "ItemCombinationStat_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MtftItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCombinationStat" ADD CONSTRAINT "ItemCombinationStat_combinedWithId_fkey" FOREIGN KEY ("combinedWithId") REFERENCES "MtftItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTraitStat" ADD CONSTRAINT "ItemTraitStat_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MtftItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTraitStat" ADD CONSTRAINT "ItemTraitStat_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "MtftTrait"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionFeaturedUnit" ADD CONSTRAINT "CompositionFeaturedUnit_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "MtftComposition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionFeaturedUnit" ADD CONSTRAINT "CompositionFeaturedUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MtftUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionFeaturedTrait" ADD CONSTRAINT "CompositionFeaturedTrait_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "MtftComposition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionFeaturedTrait" ADD CONSTRAINT "CompositionFeaturedTrait_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "MtftTrait"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionCoreUnit" ADD CONSTRAINT "CompositionCoreUnit_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "MtftComposition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionCoreUnit" ADD CONSTRAINT "CompositionCoreUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MtftUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionFlexUnit" ADD CONSTRAINT "CompositionFlexUnit_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "MtftComposition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionFlexUnit" ADD CONSTRAINT "CompositionFlexUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MtftUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionUnit" ADD CONSTRAINT "CompositionUnit_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "MtftComposition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionUnit" ADD CONSTRAINT "CompositionUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MtftUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionCoreItem" ADD CONSTRAINT "CompositionCoreItem_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "MtftComposition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionCoreItem" ADD CONSTRAINT "CompositionCoreItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MtftItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionPriorityComponent" ADD CONSTRAINT "CompositionPriorityComponent_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "MtftComposition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionPriorityComponent" ADD CONSTRAINT "CompositionPriorityComponent_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MtftItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionSpecialItem" ADD CONSTRAINT "CompositionSpecialItem_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "MtftComposition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionSpecialItem" ADD CONSTRAINT "CompositionSpecialItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MtftItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionAugmentPriority" ADD CONSTRAINT "CompositionAugmentPriority_compositionId_fkey" FOREIGN KEY ("compositionId") REFERENCES "MtftComposition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompositionAugmentPriority" ADD CONSTRAINT "CompositionAugmentPriority_augmentId_fkey" FOREIGN KEY ("augmentId") REFERENCES "MtftAugment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

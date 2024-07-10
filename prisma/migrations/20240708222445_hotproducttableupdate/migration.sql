/*
  Warnings:

  - Added the required column `productVariantId` to the `HotProduct` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HotProduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" TEXT NOT NULL,
    "counts" INTEGER NOT NULL DEFAULT 0,
    "shop" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_HotProduct" ("counts", "createdAt", "id", "productId", "shop") SELECT "counts", "createdAt", "id", "productId", "shop" FROM "HotProduct";
DROP TABLE "HotProduct";
ALTER TABLE "new_HotProduct" RENAME TO "HotProduct";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

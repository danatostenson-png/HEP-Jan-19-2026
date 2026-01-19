-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "bodyPart" TEXT,
    "difficulty" TEXT,
    "tags" TEXT,
    "imageSource" TEXT NOT NULL DEFAULT 'library_url',
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "autoDescription" TEXT,
    "analysisSource" TEXT NOT NULL DEFAULT 'manual',
    "nameAnchorUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Exercise" ("bodyPart", "createdAt", "description", "difficulty", "id", "imageSource", "imageUrl", "isCustom", "tags", "title", "updatedAt", "videoUrl") SELECT "bodyPart", "createdAt", "description", "difficulty", "id", "imageSource", "imageUrl", "isCustom", "tags", "title", "updatedAt", "videoUrl" FROM "Exercise";
DROP TABLE "Exercise";
ALTER TABLE "new_Exercise" RENAME TO "Exercise";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

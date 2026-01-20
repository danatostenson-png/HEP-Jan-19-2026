-- CreateTable
CREATE TABLE "ExpressImportLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rawText" TEXT NOT NULL,
    "parsedCount" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
    "updatedAt" DATETIME NOT NULL,
    "parsedFromExpressImport" BOOLEAN NOT NULL DEFAULT false,
    "globalCadenceApplied" BOOLEAN NOT NULL DEFAULT false,
    "autoExercisePlanId" TEXT
);
INSERT INTO "new_Exercise" ("analysisSource", "autoDescription", "bodyPart", "createdAt", "description", "difficulty", "id", "imageSource", "imageUrl", "isCustom", "nameAnchorUsed", "tags", "title", "updatedAt", "videoUrl") SELECT "analysisSource", "autoDescription", "bodyPart", "createdAt", "description", "difficulty", "id", "imageSource", "imageUrl", "isCustom", "nameAnchorUsed", "tags", "title", "updatedAt", "videoUrl" FROM "Exercise";
DROP TABLE "Exercise";
ALTER TABLE "new_Exercise" RENAME TO "Exercise";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

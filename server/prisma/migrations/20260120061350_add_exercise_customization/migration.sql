-- CreateTable
CREATE TABLE "HiddenExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    CONSTRAINT "HiddenExercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HiddenExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExerciseOverride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "bodyPart" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExerciseOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ExerciseOverride_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    "userId" TEXT,
    "parsedFromExpressImport" BOOLEAN NOT NULL DEFAULT false,
    "globalCadenceApplied" BOOLEAN NOT NULL DEFAULT false,
    "autoExercisePlanId" TEXT,
    CONSTRAINT "Exercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Exercise" ("analysisSource", "autoDescription", "autoExercisePlanId", "bodyPart", "createdAt", "description", "difficulty", "globalCadenceApplied", "id", "imageSource", "imageUrl", "isCustom", "nameAnchorUsed", "parsedFromExpressImport", "tags", "title", "updatedAt", "videoUrl") SELECT "analysisSource", "autoDescription", "autoExercisePlanId", "bodyPart", "createdAt", "description", "difficulty", "globalCadenceApplied", "id", "imageSource", "imageUrl", "isCustom", "nameAnchorUsed", "parsedFromExpressImport", "tags", "title", "updatedAt", "videoUrl" FROM "Exercise";
DROP TABLE "Exercise";
ALTER TABLE "new_Exercise" RENAME TO "Exercise";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "HiddenExercise_userId_exerciseId_key" ON "HiddenExercise"("userId", "exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseOverride_userId_exerciseId_key" ON "ExerciseOverride"("userId", "exerciseId");

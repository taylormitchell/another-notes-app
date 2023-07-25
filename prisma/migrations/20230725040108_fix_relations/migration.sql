/*
  Warnings:

  - You are about to drop the `NoteToRelatedNotes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "NoteToRelatedNotes";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_RelatedNotes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_RelatedNotes_A_fkey" FOREIGN KEY ("A") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RelatedNotes_B_fkey" FOREIGN KEY ("B") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_RelatedNotes_AB_unique" ON "_RelatedNotes"("A", "B");

-- CreateIndex
CREATE INDEX "_RelatedNotes_B_index" ON "_RelatedNotes"("B");

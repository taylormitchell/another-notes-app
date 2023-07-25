/*
  Warnings:

  - You are about to drop the `NoteToList` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "NoteToList";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "NoteToRelatedLists" (
    "noteId" INTEGER NOT NULL,
    "listId" INTEGER NOT NULL,

    PRIMARY KEY ("noteId", "listId"),
    CONSTRAINT "NoteToRelatedLists_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NoteToRelatedLists_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NoteToRelatedNotes" (
    "noteId" INTEGER NOT NULL,
    "relatedNoteId" INTEGER NOT NULL,

    PRIMARY KEY ("noteId", "relatedNoteId"),
    CONSTRAINT "NoteToRelatedNotes_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NoteToRelatedNotes_relatedNoteId_fkey" FOREIGN KEY ("relatedNoteId") REFERENCES "Note" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Note" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "parentListId" INTEGER,
    "parentNoteId" INTEGER,
    CONSTRAINT "Note_parentListId_fkey" FOREIGN KEY ("parentListId") REFERENCES "List" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Note_parentNoteId_fkey" FOREIGN KEY ("parentNoteId") REFERENCES "Note" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Note" ("author", "createdAt", "id", "text", "updatedAt") SELECT "author", "createdAt", "id", "text", "updatedAt" FROM "Note";
DROP TABLE "Note";
ALTER TABLE "new_Note" RENAME TO "Note";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

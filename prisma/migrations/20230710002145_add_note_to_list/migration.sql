-- CreateTable
CREATE TABLE "NoteToList" (
    "noteId" INTEGER NOT NULL,
    "listId" INTEGER NOT NULL,

    PRIMARY KEY ("noteId", "listId"),
    CONSTRAINT "NoteToList_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NoteToList_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_NoteToList" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_NoteToList_A_fkey" FOREIGN KEY ("A") REFERENCES "List" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_NoteToList_B_fkey" FOREIGN KEY ("B") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_NoteToList_AB_unique" ON "_NoteToList"("A", "B");

-- CreateIndex
CREATE INDEX "_NoteToList_B_index" ON "_NoteToList"("B");

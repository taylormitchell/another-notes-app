-- CreateTable
CREATE TABLE "Note" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentListId" INTEGER,
    "parentNoteId" INTEGER,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "List" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "List_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteToRelatedLists" (
    "noteId" INTEGER NOT NULL,
    "listId" INTEGER NOT NULL,

    CONSTRAINT "NoteToRelatedLists_pkey" PRIMARY KEY ("noteId","listId")
);

-- CreateTable
CREATE TABLE "_RelatedNotes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_NoteToList" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RelatedNotes_AB_unique" ON "_RelatedNotes"("A", "B");

-- CreateIndex
CREATE INDEX "_RelatedNotes_B_index" ON "_RelatedNotes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_NoteToList_AB_unique" ON "_NoteToList"("A", "B");

-- CreateIndex
CREATE INDEX "_NoteToList_B_index" ON "_NoteToList"("B");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_parentListId_fkey" FOREIGN KEY ("parentListId") REFERENCES "List"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_parentNoteId_fkey" FOREIGN KEY ("parentNoteId") REFERENCES "Note"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteToRelatedLists" ADD CONSTRAINT "NoteToRelatedLists_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteToRelatedLists" ADD CONSTRAINT "NoteToRelatedLists_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedNotes" ADD CONSTRAINT "_RelatedNotes_A_fkey" FOREIGN KEY ("A") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedNotes" ADD CONSTRAINT "_RelatedNotes_B_fkey" FOREIGN KEY ("B") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoteToList" ADD CONSTRAINT "_NoteToList_A_fkey" FOREIGN KEY ("A") REFERENCES "List"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NoteToList" ADD CONSTRAINT "_NoteToList_B_fkey" FOREIGN KEY ("B") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

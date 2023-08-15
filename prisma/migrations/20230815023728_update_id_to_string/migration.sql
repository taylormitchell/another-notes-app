/*
  Warnings:

  - The primary key for the `List` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Note` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `NoteToRelatedLists` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_parentListId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_parentNoteId_fkey";

-- DropForeignKey
ALTER TABLE "NoteToRelatedLists" DROP CONSTRAINT "NoteToRelatedLists_listId_fkey";

-- DropForeignKey
ALTER TABLE "NoteToRelatedLists" DROP CONSTRAINT "NoteToRelatedLists_noteId_fkey";

-- DropForeignKey
ALTER TABLE "_NoteToList" DROP CONSTRAINT "_NoteToList_A_fkey";

-- DropForeignKey
ALTER TABLE "_NoteToList" DROP CONSTRAINT "_NoteToList_B_fkey";

-- DropForeignKey
ALTER TABLE "_RelatedNotes" DROP CONSTRAINT "_RelatedNotes_A_fkey";

-- DropForeignKey
ALTER TABLE "_RelatedNotes" DROP CONSTRAINT "_RelatedNotes_B_fkey";

-- AlterTable
ALTER TABLE "List" DROP CONSTRAINT "List_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "List_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "List_id_seq";

-- AlterTable
ALTER TABLE "Note" DROP CONSTRAINT "Note_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "parentListId" SET DATA TYPE TEXT,
ALTER COLUMN "parentNoteId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Note_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Note_id_seq";

-- AlterTable
ALTER TABLE "NoteToRelatedLists" DROP CONSTRAINT "NoteToRelatedLists_pkey",
ALTER COLUMN "noteId" SET DATA TYPE TEXT,
ALTER COLUMN "listId" SET DATA TYPE TEXT,
ADD CONSTRAINT "NoteToRelatedLists_pkey" PRIMARY KEY ("noteId", "listId");

-- AlterTable
ALTER TABLE "_NoteToList" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_RelatedNotes" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

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

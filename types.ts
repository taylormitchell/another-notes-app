import { Note, List } from "@prisma/client";

export type NoteWithRelations = Note & {
  relatedLists: List[];
  relatedNotes: Note[];
};

export type ListWithChildren = List & {
  notes: Note[];
};

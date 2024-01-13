/**
 * Note structure as it is stored in the database.
 */
export type PersistedNote = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  upvotes: number;
};

/**
 * List structure as it is stored in the database.
 */
export type PersistedList = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Note = PersistedNote & { type: "note" };

export type List = PersistedList & { type: "list" };

export type ListEntry = {
  id: string;
  parent_list_id: string;
  child_note_id: string | null;
  child_list_id: string | null;
  position: string;
  created_at: string;
  updated_at: string;
};

export type NoteWithPosition = Note & { position: string };

export type ListWithPosition = List & { position: string };

export type ListWithChildren = List & { children: (ListWithPosition | NoteWithPosition)[] };

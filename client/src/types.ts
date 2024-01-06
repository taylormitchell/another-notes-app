export type Note = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type List = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

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

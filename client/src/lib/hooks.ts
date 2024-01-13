import { useState, useEffect, useRef } from "react";
import { Store, Event } from "./store";
import { Note } from "../types";

export function useSubscribeToEvent<T>(
  store: Store,
  shouldUpdate: (event: Event) => boolean,
  get: () => T
) {
  const [value, setValue] = useState(() => get());
  const getRef = useRef(get);
  getRef.current = get;
  const shouldUpdateRef = useRef(shouldUpdate);
  shouldUpdateRef.current = shouldUpdate;
  useEffect(() => {
    return store.subscribeToEvent((event) => {
      if (shouldUpdateRef.current(event)) {
        setValue(getRef.current());
      }
    });
  }, [store, setValue]);
  return value;
}

export function useNotes(store: Store) {
  return useSubscribeToEvent(
    store,
    (e) => e.type === "note",
    () => store.getNotes()
  );
}

export function useNote(store: Store, noteId: string) {
  return useSubscribeToEvent(
    store,
    (e) => e.type === "note" && e.id === noteId,
    () => store.getNote(noteId)
  );
}

export function useNotesWithParentIds(store: Store): (Note & { parentIds: string[] })[] {
  return useSubscribeToEvent(
    store,
    () => true,
    () => {
      const notes = store.exec<Note>("SELECT * FROM Note");
      const parentIds = store.exec<{ child_note_id: string; parent_list_id: string }>(
        "SELECT child_note_id, parent_list_id FROM ListEntry"
      );
      const parentsByNoteId = parentIds.reduce((acc, { child_note_id, parent_list_id }) => {
        if (!acc[child_note_id]) acc[child_note_id] = [];
        acc[child_note_id].push(parent_list_id);
        return acc;
      }, {} as Record<string, string[]>);
      return notes.map((note) => ({ ...note, parentIds: parentsByNoteId[note.id] ?? [] }));
    }
  );
}

export function useLists(store: Store) {
  return useSubscribeToEvent(
    store,
    () => true,
    () => store.getListsWithChildren()
  );
}

export function useListNotes(store: Store, listId: string) {
  return useSubscribeToEvent(
    store,
    (event) => {
      return (
        (event.type === "list" && event.id === listId) ||
        (event.type === "listentry" && event.parent_list_id === listId)
      );
    },
    () => store.getNotesInList(listId)
  );
}

export function useList(store: Store, listId: string) {
  return useSubscribeToEvent(
    store,
    (event) => event.type === "list" && event.id === listId,
    () => store.getList(listId)
  );
}

export function useNotesInList(store: Store, listId: string) {
  return useSubscribeToEvent(
    store,
    (event) =>
      (event.type === "listentry" && event.parent_list_id === listId) ||
      (event.type === "note" && store.listHasNoteId(listId, event.id)) ||
      (event.type === "list" && event.id === listId),
    () => store.getNotesInList(listId)
  );
}

export function useListChildren(store: Store, listId: string) {
  return useSubscribeToEvent(
    store,
    (event) => event.type === "listentry" && event.parent_list_id === listId,
    () => store.getListChildren(listId)
  );
}

export function useNoteParentIds(store: Store, noteId: string) {
  return useSubscribeToEvent(
    store,
    (event) => event.type === "listentry" && event.child_note_id === noteId,
    () => store.getNoteParentListIds(noteId)
  );
}

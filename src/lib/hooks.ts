import { Note } from "@/types";
import { useState, useEffect } from "react";
import { Store, Event, useStoreContext } from "./store";

export function useSubscribeToEvent<T>(
  store: Store,
  shouldUpdate: (event: Event) => boolean,
  get: () => T
) {
  const [, setUpdated] = useState(new Date().toISOString());
  useEffect(() => {
    return store.subscribeToEvent((event) => {
      if (shouldUpdate(event)) {
        setUpdated(new Date().toISOString());
      }
    });
  }, [store, shouldUpdate]);
  return get();
}

export function useNotes(store: Store) {
  return useSubscribeToEvent(
    store,
    (e) => e.type === "note",
    () => store.getNotes()
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
    () =>
      store
        .getNotesInList(listId)
        .map((id) => store.getNote(id))
        .filter((n): n is Note => !!n)
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

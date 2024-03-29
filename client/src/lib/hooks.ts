import { useEffect, useCallback, useReducer } from "react";
import { Store, Event } from "./store";
import { Note } from "../types";

export function useStoreQuery<T>(
  store: Store,
  // TODO: maybe call this invalidate to align with react-query
  shouldUpdate: (event: Event, store: Store) => boolean,
  get: (store: Store) => T
) {
  const update = useReducer((x) => x + 1, 0)[1];
  useEffect(
    () => store.subscribeToEvent((e) => shouldUpdate(e, store) && update()),
    [store, update, shouldUpdate, get]
  );
  return get(store);
}

// version where we cache the results
// export function useStoreQuery<T>(
//   store: Store,
//   shouldUpdate: (event: Event, store: Store) => boolean,
//   get: (store: Store) => T
// ) {
// const [value, setValue] = useState(() => get(store));
// useEffect(() => {
//   setValue(get(store));
//   return store.subscribeToEvent((event) => {
//     if (shouldUpdate(event, store)) {
//       setValue(get(store));
//     }
//   });
// }, [store, setValue, shouldUpdate, get]);
// return value;
// }

export function useNotes(store: Store) {
  return useStoreQuery(
    store,
    useCallback((e) => e.type === "note", []),
    useCallback((s) => s.exec<Note[]>("SELECT *, 'note' as type FROM Note"), [])
  );
}

export function useNote(store: Store, noteId: string) {
  return useStoreQuery(
    store,
    useCallback((e: Event) => e.type === "note" && e.id === noteId, [noteId]),
    useCallback((s) => s.getNote(noteId), [noteId])
  );
}

export function useNotesWithParentIds(store: Store): (Note & { parentIds: string[] })[] {
  return useStoreQuery(
    store,
    useCallback(() => true, []),
    useCallback((store) => {
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
    }, [])
  );
}

export function useLists(store: Store) {
  return useStoreQuery(
    store,
    useCallback(() => true, []),
    useCallback((s) => s.getListsWithChildren(), [])
  );
}

export function useListNotes(store: Store, listId: string) {
  return useStoreQuery(
    store,
    useCallback(
      (event) => {
        return (
          (event.type === "list" && event.id === listId) ||
          (event.type === "listentry" && event.parent_list_id === listId)
        );
      },
      [listId]
    ),
    useCallback((store) => store.getNotesInList(listId), [listId])
  );
}

export function useList(store: Store, listId: string) {
  return useStoreQuery(
    store,
    useCallback((event: Event) => event.type === "list" && event.id === listId, [listId]),
    useCallback(() => store.getList(listId), [store, listId])
  );
}

export function useNotesInList(store: Store, listId: string) {
  return useStoreQuery(
    store,
    useCallback(
      (event, store) =>
        (event.type === "listentry" && event.parent_list_id === listId) ||
        (event.type === "note" && store.listHasNoteId(listId, event.id)) ||
        (event.type === "list" && event.id === listId),
      [listId]
    ),
    useCallback((store) => store.getNotesInList(listId), [listId])
  );
}

export function useListChildren(store: Store, listId: string) {
  return useStoreQuery(
    store,
    useCallback((event) => event.type === "listentry" && event.parent_list_id === listId, [listId]),
    useCallback((store) => store.getListChildren(listId), [listId])
  );
}

export function useNoteParentIds(store: Store, noteId: string) {
  return useStoreQuery(
    store,
    useCallback((event) => event.type === "listentry" && event.child_note_id === noteId, [noteId]),
    useCallback((store) => store.getNoteParentListIds(noteId), [noteId])
  );
}

export function useListParentIds(store: Store, listId: string) {
  return useStoreQuery(
    store,
    useCallback((event) => event.type === "listentry" && event.child_list_id === listId, [listId]),
    useCallback((store) => store.getNoteParentListIds(listId), [listId])
  );
}

export function useItemParentIds(store: Store, itemId: string) {
  return useStoreQuery(
    store,
    useCallback(
      (event) =>
        event.type === "listentry" &&
        (event.child_note_id === itemId || event.child_list_id === itemId),
      [itemId]
    ),
    useCallback((store) => store.getItemParentIds(itemId), [itemId])
  );
}

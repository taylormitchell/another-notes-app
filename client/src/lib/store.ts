import {
  Note,
  NoteWithPosition,
  List,
  ListEntry,
  PersistedNote,
  PersistedList,
  ListWithPosition,
  ListWithChildren,
} from "../types";
import { Database, BindParams } from "sql.js";
import { generatePositionBetween, uuid } from "./utils";
import { createContext, useContext, useState, useEffect } from "react";
import { createSqlite } from "./sqlite";
import { env } from "./env";
import { api } from "./api";
import { log } from "./log";

type Operation = "create" | "updated" | "delete";

export type Event =
  | {
      type: "note";
      operation: Operation;
      id: string;
    }
  | {
      type: "list";
      operation: Operation;
      id: string;
    }
  | {
      type: "listentry";
      operation: Operation;
      id: string;
      parent_list_id: string;
      child_note_id: string | null;
      child_list_id: string | null;
    };

type EventListener = (event: Event) => void;

export class Store {
  private eventListeners = new Set<EventListener>();
  constructor(
    private db: Database,
    private sqlToApi: (sql: string, params?: BindParams | undefined) => void = () => {}
  ) {
    this.addTriggers();
  }

  /**
   * Create a function that can be used in SQLite to emit events.
   * This is used to trigger updates in the UI.
   */
  addTriggers() {
    this.db.create_function(
      "emit_list_or_note_event",
      (type: "note" | "list", operation: Operation, id: string) => {
        const event: Event = { type, operation, id };
        console.log("emit_event", event);
        this.eventListeners.forEach((l) => l(event));
      }
    );
    this.db.create_function(
      "emit_list_entry_event",
      (
        type: "listentry",
        operation: Operation,
        id: string,
        parent_list_id: string,
        child_note_id: string | null,
        child_list_id: string | null
      ) => {
        const event: Event = { type, operation, id, parent_list_id, child_note_id, child_list_id };
        console.log("emit_event", event);
        this.eventListeners.forEach((l) => l(event));
      }
    );
    for (const table of ["note", "list", "listentry"]) {
      for (const operation of ["INSERT", "UPDATE", "DELETE"]) {
        const triggerName = `${table}_${operation}`;
        const recordAlias = operation === "DELETE" ? "OLD" : "NEW";
        if (table === "listentry") {
          this.db.exec(`
            DROP TRIGGER IF EXISTS ${triggerName};
            CREATE TRIGGER ${triggerName} AFTER ${operation} ON ${table}
            BEGIN
              SELECT emit_list_entry_event('${table}', '${operation}', ${recordAlias}.id, ${recordAlias}.parent_list_id, ${recordAlias}.child_note_id, ${recordAlias}.child_list_id);
            END;
          `);
        } else {
          this.db.exec(`
            DROP TRIGGER IF EXISTS ${triggerName};
            CREATE TRIGGER ${triggerName} AFTER ${operation} ON ${table}
            BEGIN
              SELECT emit_list_or_note_event('${table}', '${operation}', ${recordAlias}.id);
            END;
          `);
        }
      }
    }
  }

  exec = <T>(sql: string, params?: BindParams | undefined) => {
    try {
      this.sqlToApi(sql, params);
      const result = this.db.exec(sql, params);
      if (!result || !result[0]) {
        log("exec").info({ sql, params, count: 0 });
        return [];
      }
      const keys = result[0].columns;
      const values = result[0].values.map((values) => {
        const obj = {} as Record<string, unknown>;
        keys.forEach((key, i) => {
          obj[key] = values[i];
        });
        return obj as T;
      });
      log("exec").info({ sql, params, count: values.length });
      return values;
    } catch (e) {
      log("exec").error({ sql, params, error: e });
      throw e;
    }
  };

  subscribeToEvent = (listener: EventListener) => {
    this.eventListeners.add(listener);
    return () => {
      this.eventListeners.delete(listener);
    };
  };

  addNote({
    id = uuid(),
    content = "",
    created_at = new Date().toISOString(),
    updated_at = "", // TODO
    listPositions = [] as { id: string; position?: string }[],
  } = {}) {
    const note = { id, content, created_at, updated_at: updated_at || created_at };
    // TODO these should be in a transaction
    this.exec("INSERT INTO Note (id, content, created_at, updated_at) VALUES (?, ?, ?, ?)", [
      note.id,
      note.content,
      note.created_at,
      note.updated_at,
    ]);
    if (listPositions.length) {
      this.addNoteToLists({ noteId: note.id, listPositions });
    }
    return note;
  }

  updateNote({ id, content }: { id: string; content: string }) {
    console.log("updateNote", { id, content });
    this.exec("UPDATE Note SET content = ?, updated_at = ? WHERE id = ?", [
      content,
      new Date().toISOString(),
      id,
    ]);
    const note = this.getNote(id);
    if (!note) return;
    return note;
  }

  getNote(id: string): Note | undefined {
    const result = this.exec<PersistedNote>("SELECT * FROM Note WHERE id = ?", [id]);
    return result[0] ? { ...result[0], type: "note" } : undefined;
  }

  deleteNote(id: string) {
    this.exec("DELETE FROM Note WHERE id = ?;", [id]);
  }

  getNotes(): Note[] {
    return this.exec<PersistedNote>("SELECT * FROM Note").map((n) => ({ ...n, type: "note" }));
  }

  getListEntry(id: string): ListEntry | undefined {
    const result = this.exec<ListEntry>("SELECT * FROM ListEntry WHERE id = ?", [id]);
    return result[0];
  }

  addList({ id = uuid(), name = "", created_at = "", updated_at = "" } = {}) {
    const now = new Date().toISOString();
    const list = { id, name, created_at: created_at || now, updated_at: updated_at || now };
    this.exec("INSERT INTO List (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)", [
      list.id,
      list.name,
      list.created_at,
      list.updated_at,
    ]);
    return list;
  }

  getList(id: string): List | undefined {
    const lists = this.exec<PersistedList>("SELECT * FROM List WHERE id = ?", [id]);
    return lists[0] ? { ...lists[0], type: "list" } : undefined;
  }

  updateList({ id, name }: { id: string; name: string }): List | undefined {
    this.exec("UPDATE List SET name = ?, updated_at = ? WHERE id = ?", [
      name,
      new Date().toISOString(),
      id,
    ]);
    const list = this.getList(id);
    if (!list) return;
    return list;
  }

  deleteList(id: string) {
    const list = this.getList(id);
    if (!list) return;
    this.exec("DELETE FROM List WHERE id = ?", [id]);
  }

  getLists(listIds?: string[]): List[] {
    const lists = listIds
      ? this.exec<PersistedList>(
          `SELECT * FROM List WHERE id IN (${listIds.map(() => "?").join(", ")})`,
          listIds
        )
      : this.exec<PersistedList>("SELECT * FROM List");
    return lists.map((l) => ({ ...l, type: "list" }));
  }

  getBottomPosition(listId: string) {
    const res = this.exec<{ position: string }>(
      "SELECT MAX(position) as position FROM ListEntry WHERE parent_list_id = ?",
      [listId]
    );
    if (!res || !res[0]) return generatePositionBetween(null, null);
    return generatePositionBetween(res[0]?.position ?? null, null);
  }

  getTopPosition(listId: string) {
    const res = this.exec<{ position: string }>(
      "SELECT MIN(position) as position FROM ListEntry WHERE parent_list_id = ?",
      [listId]
    );
    if (!res || !res[0]) return generatePositionBetween(null, null);
    return generatePositionBetween(null, res[0]?.position ?? null);
  }

  addNoteToLists({
    noteId,
    listPositions,
  }: {
    noteId: string;
    listPositions: { id: string; position?: string }[];
  }) {
    if (!listPositions.length) {
      console.warn("addNoteToLists called with empty listPositions");
    }
    const now = new Date().toISOString();
    const entries = listPositions.map((l) => ({
      id: uuid(),
      parent_list_id: l.id,
      child_note_id: noteId,
      // position: l.position ?? this.getBottomPosition(l.id),
      position: l.position ?? this.getTopPosition(l.id),
      created_at: now,
      updated_at: now,
    }));
    this.exec(
      "INSERT INTO ListEntry (id, parent_list_id, child_note_id, position, created_at, updated_at) VALUES " +
        entries.map(() => "(?, ?, ?, ?, ?, ?)").join(", "),
      entries.flatMap((e) => [
        e.id,
        e.parent_list_id,
        e.child_note_id,
        e.position,
        e.created_at,
        e.updated_at,
      ])
    );
  }

  addNoteToList({
    noteId,
    listId,
    position,
  }: {
    noteId: string;
    listId: string;
    position?: string;
  }) {
    const now = new Date().toISOString();
    const entry = {
      id: uuid(),
      parent_list_id: listId,
      child_note_id: noteId,
      position: position ?? this.getTopPosition(listId),
      created_at: now,
      updated_at: now,
    };
    this.exec(
      "INSERT INTO ListEntry (id, parent_list_id, child_note_id, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      [
        entry.id,
        entry.parent_list_id,
        entry.child_note_id,
        entry.position,
        entry.created_at,
        entry.updated_at,
      ]
    );
  }

  removeNoteFromList({ noteId, listId }: { noteId: string; listId: string }) {
    this.exec("DELETE FROM ListEntry WHERE child_note_id = ? AND parent_list_id = ?", [
      noteId,
      listId,
    ]);
  }

  /**
   * Provide an array of list ids which the note should belong to.
   * If the note is already in a list, leave it.
   * If the note is in a list that is not in the array, remove it from that list.
   * If the note is not in a list, use addNoteToLists to add it to the lists.
   */
  setNoteParents({ noteId, listIds }: { noteId: string; listIds: string[] }) {
    const currentListIds = this.getNoteParentListIds(noteId);
    const listsToAdd = listIds.filter((id) => !currentListIds.includes(id));
    const listsToRemove = currentListIds.filter((id) => !listIds.includes(id));
    if (listsToAdd.length > 0) {
      this.addNoteToLists({ noteId, listPositions: listsToAdd.map((id) => ({ id })) });
    }
    if (listsToRemove.length > 0) {
      this.removeNoteFromLists({ noteId, listIds: listsToRemove });
    }
  }

  removeNoteFromLists({ noteId, listIds }: { noteId: string; listIds: string[] }) {
    this.exec(
      `DELETE FROM ListEntry WHERE child_note_id = ? AND parent_list_id IN (${listIds
        .map(() => "?")
        .join(", ")})`,
      [noteId, ...listIds]
    );
  }

  getNoteParentListIds(noteId: string): string[] {
    const res = this.exec<{ parent_list_id: string }>(
      "SELECT parent_list_id FROM ListEntry WHERE child_note_id = ?",
      [noteId]
    );
    return res.map((r) => r.parent_list_id);
  }

  getListsWithNoteId(noteId: string): string[] {
    const res = this.exec<{ parent_list_id: string }>(
      "SELECT parent_list_id FROM ListEntry WHERE child_note_id = ?",
      [noteId]
    );
    return res.map((r) => r.parent_list_id);
  }

  listHasChild(listId: string, childId: string) {
    const res = this.exec<ListEntry>(
      "SELECT * FROM ListEntry WHERE parent_list_id = ? AND (child_note_id = ? OR child_list_id = ?)",
      [listId, childId, childId]
    );
    return !!res.length;
  }

  getNotesInList(listId: string): NoteWithPosition[] {
    return this.exec<PersistedNote & { position: string }>(
      `SELECT note.id, note.content, note.created_at, note.updated_at, listentry.position
      FROM listentry
      LEFT JOIN note ON listentry.child_note_id = note.id
      WHERE listentry.parent_list_id = ?`,
      [listId]
    ).map((n) => ({ ...n, type: "note" }));
  }

  getListChildren(listId: string): (ListWithPosition | NoteWithPosition)[] {
    const notes = this.exec<NoteWithPosition>(
      `
      SELECT note.id, note.content, note.created_at, note.updated_at, listentry.position, 'note' as type
      FROM listentry
      LEFT JOIN note ON listentry.child_note_id = note.id
      WHERE listentry.parent_list_id = ? AND listentry.child_note_id IS NOT NULL
    `,
      [listId]
    );
    const lists = this.exec<ListWithPosition>(
      `
      SELECT list.id, list.name, list.created_at, list.updated_at, listentry.position, 'list' as type
      FROM listentry
      LEFT JOIN list ON listentry.child_list_id = list.id
      WHERE listentry.parent_list_id = ? AND listentry.child_list_id IS NOT NULL
    `,
      [listId]
    );
    return [...notes, ...lists];
  }

  getListsWithChildren(listIds?: string[]): ListWithChildren[] {
    const lists = this.getLists(listIds);
    const result = this.exec<PersistedNote & { parent_list_id: string; position: string }>(
      `SELECT ListEntry.parent_list_id, ListEntry.position, Note.id, Note.content, Note.created_at, Note.updated_at
      FROM ListEntry
      LEFT JOIN Note ON ListEntry.child_note_id = Note.id
      ${listIds ? `WHERE ListEntry.parent_list_id IN (${listIds.map(() => "?").join(", ")})` : ""}
      ORDER BY ListEntry.parent_list_id, ListEntry.position
      `,
      listIds
    );
    const notesByListId = result.reduce(
      (acc, { parent_list_id, id, content, created_at, updated_at, position, upvotes }) => {
        if (!acc[parent_list_id]) acc[parent_list_id] = [];
        acc[parent_list_id].push({
          id,
          type: "note",
          content,
          created_at,
          updated_at,
          position,
          upvotes,
        });
        return acc;
      },
      {} as Record<string, (Note & { position: string })[]>
    );
    return lists.map((list) => ({ ...list, children: notesByListId[list.id] ?? [] }));
  }

  listHasNoteId(listId: string, noteId: string) {
    const res = this.exec<ListEntry>(
      "SELECT * FROM ListEntry WHERE parent_list_id = ? AND child_note_id = ?",
      [listId, noteId]
    );
    return !!res.length;
  }

  upvoteNote(noteId: string) {
    this.exec("UPDATE Note SET upvotes = upvotes + 1, updated_at = ? WHERE id = ?", [
      new Date().toISOString(),
      noteId,
    ]);
  }

  downvoteNote(noteId: string) {
    this.exec("UPDATE Note SET upvotes = upvotes - 1, updated_at = ? WHERE id = ?", [
      new Date().toISOString(),
      noteId,
    ]);
  }
}

export const StoreContext = createContext<null | Store>(null);

export const useStoreContext = (): Store => {
  const store = useContext(StoreContext);
  if (!store) throw new Error("Store not found");
  return store;
};

export const useStore = ():
  | {
      store: null;
      isLoading: true;
    }
  | {
      store: Store;
      isLoading: false;
    } => {
  const [store, setStore] = useState<Store | null>(null);
  useEffect(() => {
    (async () => {
      console.log({ frontend_env: env });
      if (env.isPersistenceDisabled) {
        setStore(new Store(await createSqlite()));
        return;
      }
      try {
        const response = await api.get("/sqlite", { responseType: "arraybuffer" });
        const array = new Uint8Array(response.data);
        const db = await createSqlite(array);
        const sqlToApi = async (sql: string, params?: BindParams | undefined) => {
          await api.post("/sqlite", { sql, params });
        };
        console.log("db", db);
        const store = new Store(db, sqlToApi);
        console.log("store", store);
        setStore(store);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);
  if (!store) {
    return { store: null, isLoading: true };
  } else {
    return { store, isLoading: false };
  }
};

import { Note, List, ListEntry } from "../types";
import { Database, BindParams } from "sql.js";
import { generatePositionBetween, uuid } from "./utils";
import { createContext, useContext, useState, useEffect } from "react";
import { createSqlite } from "./sqlite";

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
      type: "listEntry";
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
    this.createTriggers();
  }

  /**
   * Create a function that can be used in SQLite to emit events.
   * This is used to trigger updates in the UI.
   */
  createTriggers() {
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
        type: "listEntry",
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
    console.log("exec", sql, params);
    this.sqlToApi(sql, params);
    const result = this.db.exec(sql, params);
    if (!result || !result[0]) return [];
    const keys = result[0].columns;
    return result[0].values.map((values) => {
      const obj = {} as Record<string, unknown>;
      keys.forEach((key, i) => {
        obj[key] = values[i];
      });
      return obj as T;
    });
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
  } = {}) {
    const note = { id, content, created_at, updated_at: updated_at || created_at };
    this.exec("INSERT INTO Note (id, content, created_at, updated_at) VALUES (?, ?, ?, ?)", [
      note.id,
      note.content,
      note.created_at,
      note.updated_at,
    ]);
    return note;
  }

  updateNote({ id, content }: { id: string; content: string }) {
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
    const result = this.exec<Note>("SELECT * FROM Note WHERE id = ?", [id]);
    return result[0];
  }

  deleteNote(id: string) {
    this.exec("DELETE FROM Note WHERE id = ?;", [id]);
  }

  getNotes(): Note[] {
    return this.exec<Note>("SELECT * FROM Note");
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
    const lists = this.exec<List>("SELECT * FROM List WHERE id = ?", [id]);
    return lists[0];
  }

  updateList({ id, name }: { id: string; name: string }) {
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
    return listIds
      ? this.exec<List>(
          `SELECT * FROM List WHERE id IN (${listIds.map(() => "?").join(", ")})`,
          listIds
        )
      : this.exec<List>("SELECT * FROM List");
  }

  getBottomPosition(listId: string) {
    const res = this.exec<{ position: string }>(
      "SELECT MAX(position) as position FROM ListEntry WHERE parent_list_id = ?",
      [listId]
    );
    if (!res || !res[0]) return generatePositionBetween(null, null);
    return generatePositionBetween(res[0].position, null);
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
      position: l.position ?? this.getBottomPosition(l.id),
      created_at: now,
    }));
    this.exec(
      "INSERT INTO ListEntry (id, parent_list_id, child_note_id, position, created_at) VALUES " +
        entries.map(() => "(?, ?, ?, ?, ?)").join(", "),
      entries.flatMap((e) => [e.id, e.parent_list_id, e.child_note_id, e.position, e.created_at])
    );
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

  getNotesInList(listId: string): string[] {
    const res = this.exec<{ child_note_id: string }>(
      "SELECT child_note_id FROM ListEntry WHERE parent_list_id = ?",
      [listId]
    );
    return res.map((r) => r.child_note_id);
  }

  getListsWithChildren(
    listIds?: string[]
  ): (List & { children: (Note & { position: string })[] })[] {
    const lists = this.getLists(listIds);
    const result = this.exec<Note & { parent_list_id: string; position: string }>(
      `SELECT ListEntry.parent_list_id, ListEntry.position, Note.id, Note.content, Note.created_at, Note.updated_at
      FROM ListEntry
      LEFT JOIN Note ON ListEntry.child_note_id = Note.id
      ${listIds ? `WHERE ListEntry.parent_list_id IN (${listIds.map(() => "?").join(", ")})` : ""}
      ORDER BY ListEntry.parent_list_id, ListEntry.position
      `,
      listIds
    );
    const notesByListId = result.reduce(
      (acc, { parent_list_id, id, content, created_at, position }) => {
        if (!acc[parent_list_id]) acc[parent_list_id] = [];
        acc[parent_list_id].push({ id, content, created_at, position });
        return acc;
      },
      {} as Record<string, (Note & { position: string })[]>
    );
    return lists.map((list) => ({ ...list, children: notesByListId[list.id] ?? [] }));
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
    createSqlite().then((db) => {
      setStore(new Store(db));
    });
  }, []);
  if (!store) {
    return { store: null, isLoading: true };
  } else {
    return { store, isLoading: false };
  }
};

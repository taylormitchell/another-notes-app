import { useCallback, useEffect, useRef } from "react";
import { useStoreContext } from "../lib/store";
import { Note } from "../types";
import { ArrowDown, ArrowUp, List, Maximize2 } from "react-feather";
import { Link } from "react-router-dom";
import { useLists, useNoteParentIds } from "../lib/hooks";

export function NoteCard({ note, position }: { note: Note; position?: string }) {
  const store = useStoreContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const lists = useLists(store);
  const listIds = useNoteParentIds(store, note.id);

  const save = useCallback(() => {
    if (!contentRef.current) return;
    const lines: string[] = [];
    contentRef.current.childNodes.forEach((node) => {
      lines.push(node.textContent ?? "");
    });
    store.updateNote({
      id: note.id,
      content: lines.join("\n"),
    });
  }, [note.id, store]);

  // save on focusout
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.addEventListener("focusout", save);
    return () => {
      el.removeEventListener("focusout", save);
    };
  }, [save]);

  return (
    <div className="rounded overflow-hidden shadow-md bg-white">
      <div
        ref={contentRef}
        className="p-4"
        contentEditable
        suppressContentEditableWarning
        // delete on backspace if empty
        onKeyDown={(e) => {
          if (e.key === "Backspace" && e.currentTarget.textContent === "") {
            e.preventDefault();
            store.deleteNote(note.id);
          }
        }}
        dangerouslySetInnerHTML={{
          __html: note.content
            .split("\n")
            .map((line) => `<div>${line}</div>`)
            .join(""),
        }}
      />
      <div className="text-gray-600 text-sm flex items-center p-2 gap-2">
        {position ?? (
          <div>
            {new Date(note.created_at).toLocaleString()} ({position})
          </div>
        )}
        {/* upvote button */}
        <div>
          <button
            onClick={() => {
              store.upvoteNote(note.id);
            }}
          >
            <ArrowUp size={16} />
          </button>
          <button
            onClick={() => {
              store.downvoteNote(note.id);
            }}
          >
            <ArrowDown size={16} />
          </button>
          <span>({note.upvotes})</span>
        </div>
        <div>
          <Link to={`/notes/${note.id}`}>
            <Maximize2 size={16} />
          </Link>
        </div>
        {/* multi-select lists the note belongs to */}
        <div>
          <select
            multiple
            value={listIds}
            onChange={(e) => {
              const listIds = Array.from(e.target.selectedOptions).map((option) => option.value);
              store.setNoteParents({ noteId: note.id, listIds });
            }}
          >
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

/**
 * List selection
 * - Shows all list the note belongs to in a row
 * - Each list has a little x button to remove the note from the list
 * - There's an input at the end to search for a list to add the note to
 * - When you click on a list in the dropdown, it adds the note to the list
 */
function ListSelection({ note }: { note: Note }) {
  const store = useStoreContext();
  const lists = useLists(store);
  const listIds = useNoteParentIds(store, note.id);

  return (
    <div className="flex items-center gap-2">
      {listIds.map((listId) => {
        const list = lists.find((list) => list.id === listId);
        if (!list) return null;
        return (
          <div key={list.id} className="flex items-center gap-2">
            <Link to={`/lists/${list.id}`}>
              <div className="flex items-center gap-2">
                <List />
                {list.name}
              </div>
            </Link>
            <button
              className="w-8"
              onClick={() => {
                store.removeNoteFromList({ noteId: note.id, listId });
              }}
            >
              x
            </button>
          </div>
        );
      })}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Add to list..."
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const list = lists.find((list) => list.name === e.currentTarget.value);
              if (list) {
                store.addNoteToList({ noteId: note.id, listId: list.id });
              }
            }
          }}
        />
      </div>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { useStoreContext } from "../lib/store";
import { Note } from "../types";
import { ArrowDown, ArrowUp, Maximize2 } from "react-feather";
import { Link } from "react-router-dom";
import { useHotkey } from "../lib/utils";
import { useDisplayContext } from "../lib/DisplayContext";
import ListSelection from "./ListSelection";
import { useNoteParentIds } from "../lib/hooks";

export function NoteCard({
  note,
  position,
  autofocus,
  focusRef,
}: {
  note: Note;
  position?: string;
  autofocus?: boolean;
  focusRef?: React.MutableRefObject<Note | null>;
}) {
  const store = useStoreContext();
  const { view } = useDisplayContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const showDetails = view === "card" || hover || focused;
  const [showLists, setShowLists] = useState(false);

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

  // pass focus up to parent
  useEffect(() => {
    if (focused && focusRef) {
      focusRef.current = note;
    }
  }, [focused, focusRef, note]);

  useHotkey("Escape", () => {
    if (focused) {
      contentRef.current?.blur();
    }
  });

  // autofocus
  useEffect(() => {
    if (autofocus) {
      contentRef.current?.focus();
    }
  }, [autofocus]);

  return (
    <div
      // className={`rounded bg-white ${view === "card" ? "shadow-md" : ""}`}
      className={`rounded bg-white ${view === "card" ? "border border-gray-200" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        ref={contentRef}
        className="note p-2"
        contentEditable
        suppressContentEditableWarning
        // delete on backspace if empty
        onKeyDown={(e) => {
          if (e.key === "Backspace" && e.currentTarget.textContent === "") {
            e.preventDefault();
            store.deleteNote(note.id);
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        dangerouslySetInnerHTML={{
          __html: note.content
            .split("\n")
            .map((line) => (line === "" ? "<br />" : `<div>${line}</div>`))
            .join(""),
        }}
      />
      {showDetails && (
        <div className="h-8 text-gray-600 text-sm flex items-center p-2 gap-2">
          <>
            <div>({position ?? ""})</div>
            <div className="flex items-center gap-1">
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
            <div></div>
            {showLists ? (
              <CardListSelection note={note} close={() => setShowLists(false)} />
            ) : (
              <button onClick={() => setShowLists(true)}>Lists</button>
            )}
          </>
        </div>
      )}
    </div>
  );
}

function CardListSelection({ note, close }: { note: Note; close: () => void }) {
  const store = useStoreContext();
  const listIdsWithNote = useNoteParentIds(store, note.id);
  return (
    <>
      <div className="relative">
        <div className="absolute top-0 left-0 z-13">
          <ListSelection
            selectedIds={listIdsWithNote}
            toggleSelection={(id: string) => {
              if (listIdsWithNote.includes(id)) {
                store.removeNoteFromList({ noteId: note.id, listId: id });
              } else {
                store.addNoteToList({ noteId: note.id, listId: id });
              }
            }}
            close={close}
          />
        </div>
      </div>
    </>
  );
}

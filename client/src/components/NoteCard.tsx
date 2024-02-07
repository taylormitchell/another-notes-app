import { useCallback, useEffect, useRef, useState } from "react";
import { useStoreContext } from "../lib/store";
import { Note } from "../types";
import { ArrowDown, ArrowUp, Maximize2 } from "react-feather";
import { Link } from "react-router-dom";
import { useHotkey } from "../lib/utils";
import { useDisplayContext } from "../lib/DisplayContext";
import { CardListSelection } from "./CardListSelection";

export function NoteCard({
  note,
  position,
  autoFocus,
}: {
  note: Note;
  position?: string;
  autoFocus?: boolean;
}) {
  const store = useStoreContext();
  const { view } = useDisplayContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const showDetails = view === "card" || hover || focused;
  const isDirtyRef = useRef(false);

  const save = useCallback(() => {
    if (!contentRef.current) return;
    if (!isDirtyRef.current) return;
    const lines: string[] = [];
    contentRef.current.childNodes.forEach((node) => {
      lines.push(node.textContent ?? "");
    });
    store.updateNote({
      id: note.id,
      content: lines.join("\n"),
    });
    isDirtyRef.current = false;
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

  useHotkey("Escape", () => {
    if (focused) {
      contentRef.current?.blur();
    }
  });

  // autofocus
  useEffect(() => {
    if (autoFocus) {
      contentRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <div
      className={`w-full rounded bg-white ${view === "card" ? "border border-gray-200" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        ref={contentRef}
        className="note p-2"
        data-note-id={note.id}
        contentEditable
        onInput={() => (isDirtyRef.current = true)}
        autoFocus={autoFocus}
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
            {/* set focus on button press */}
            <button onClick={() => contentRef.current?.focus()}>focus</button>
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
            <CardListSelection itemId={note.id} />
          </>
        </div>
      )}
    </div>
  );
}

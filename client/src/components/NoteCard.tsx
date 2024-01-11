import { useRef } from "react";
import { useStoreContext } from "../lib/store";
import { Note } from "../types";
import { ArrowDown, ArrowUp, Maximize2 } from "react-feather";
import { Link } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";

export function NoteCard({ note, position }: { note: Note; position?: string }) {
  const store = useStoreContext();
  const contentRef = useRef<HTMLDivElement>(null);
  function save() {
    if (!contentRef.current) return;
    const lines: string[] = [];
    contentRef.current.childNodes.forEach((node) => {
      lines.push(node.textContent ?? "");
    });
    store.updateNote({
      id: note.id,
      content: lines.join("\n"),
    });
  }
  const debouncedSave = useDebouncedCallback(save, 1000);

  return (
    <div className="rounded overflow-hidden shadow-md bg-white">
      <div
        ref={contentRef}
        className="p-4"
        contentEditable
        suppressContentEditableWarning
        onBlur={save}
        // delete on backspace if empty
        onKeyDown={(e) => {
          if (e.key === "Backspace" && e.currentTarget.textContent === "") {
            e.preventDefault();
            store.deleteNote(note.id);
          } else {
            debouncedSave();
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
      </div>
    </div>
  );
}

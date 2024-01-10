import { useStoreContext } from "../lib/store";
import { Note } from "../types";
import { ArrowDown, ArrowUp, Maximize2 } from "react-feather";
import { Link } from "react-router-dom";

export function NoteCard({ note, position }: { note: Note; position?: string }) {
  const store = useStoreContext();
  return (
    <div className="rounded overflow-hidden shadow-md bg-white">
      <div
        className="p-4"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const lines: string[] = [];
          e.currentTarget.childNodes.forEach((node) => {
            lines.push(node.textContent ?? "");
          });
          store.updateNote({ id: note.id, content: lines.join("\n") });
        }}
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
      </div>
    </div>
  );
}
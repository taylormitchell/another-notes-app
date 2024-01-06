import { useStoreContext } from "../lib/store";
import { Note } from "../types";

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
      <div className="text-gray-600 text-sm">
        {position ?? (
          <div>
            {new Date(note.created_at).toLocaleString()} ({position})
          </div>
        )}
      </div>
    </div>
  );
}

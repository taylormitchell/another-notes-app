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
}: {
  note: Note;
  position?: string;
  autofocus?: boolean;
}) {
  const store = useStoreContext();
  const { view } = useDisplayContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showLists, setShowLists] = useState(false);
  const countLists = useNoteParentIds(store, note.id).length;
  const showDetails = view === "card" || hover || focused;
  const listIdsWithNote = useNoteParentIds(store, note.id);

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
      className={`rounded bg-white ${view === "card" ? "shadow-md" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        ref={contentRef}
        className="note p-4"
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
      <div className="h-8 text-gray-600 text-sm flex items-center p-2 gap-2">
        {showDetails && (
          <>
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
            <div></div>
            {showLists ? (
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
                    close={() => setShowLists(false)}
                  />
                </div>
              </div>
            ) : (
              <button onClick={() => setShowLists(true)}>{countLists} Lists</button>
            )}
            {/* <div>
            <ListSelection note={note} />
          </div> */}
          </>
        )}
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
// function ListSelection({ note }: { note: Note }) {
//   const store = useStoreContext();
//   const lists = useLists(store);
//   const listIds = useNoteParentIds(store, note.id);

//   return (
//     <div className="flex items-center gap-2">
//       {listIds.map((listId) => {
//         const list = lists.find((list) => list.id === listId);
//         if (!list) return null;
//         return (
//           <div key={list.id} className="flex items-center gap-2">
//             <Link to={`/lists/${list.id}`}>
//               <div className="flex items-center gap-2">
//                 <List />
//                 {list.name}
//               </div>
//             </Link>
//             <button
//               className="w-8"
//               onClick={() => {
//                 store.removeNoteFromList({ noteId: note.id, listId });
//               }}
//             >
//               x
//             </button>
//           </div>
//         );
//       })}
//       <div className="flex items-center gap-2">
//         <input
//           type="text"
//           placeholder="Add to list..."
//           className="border border-gray-300 rounded-md p-2 focus:outline-none focus:border-blue-500"
//         />
//       </div>
//     </div>
//   );
// }

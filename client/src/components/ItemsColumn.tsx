import { Link } from "react-router-dom";
import { generatePositionBetween, inputFocused, noModifiers, useHotkey } from "../lib/utils";
import { List, Note, hasPosition } from "../types";
import { NoteCard } from "./NoteCard";
import { useStoreContext } from "../lib/store";
import { useRef } from "react";

// TODO: feels sketchy that I need to do all the checks for list and positions
// - maybe make it so when a list is provided, the children type is NoteWithPosition | ListWithPosition
function ItemsColumn({ children, list }: { children: (Note | List)[]; list?: List }) {
  const store = useStoreContext();
  const focusedNote = useRef<string | null>(null);

  const addNoteAtTop = () => {
    const top = children[0];
    return store.addNote({
      listPositions:
        list && hasPosition(top)
          ? [
              {
                id: list.id,
                position: generatePositionBetween(null, top.position ?? null),
              },
            ]
          : [],
    });
  };

  useHotkey(
    (e) => e.key === "n" && noModifiers(e),
    () => {
      if (inputFocused()) return false;
      const note = addNoteAtTop();
      focusedNote.current = note?.id ?? null;
    }
  );

  useHotkey(
    (e) => e.metaKey && e.key === "Enter",
    () => {
      if (!focusedNote.current) return;
      const i = children.findIndex((child) => child.id === focusedNote.current);
      const before = children[i];
      const after = children[i + 1];
      if (!list || !hasPosition(before) || !hasPosition(after)) return;
      const n = store.addNote({
        listPositions: [
          {
            id: list.id,
            position: generatePositionBetween(before.position ?? null, after.position ?? null),
          },
        ],
      });
      focusedNote.current = n.id;
    }
  );

  return (
    <main className="max-w-2xl mx-auto flex flex-col items-center">
      <ul
        className="w-full"
        onFocus={(e) => {
          const id = e.target.getAttribute("data-note-id");
          if (id) focusedNote.current = id;
        }}
        onBlur={() => (focusedNote.current = null)}
      >
        <li key="top-bottom">
          <button className="w-full h-4 hover:bg-blue-100" onClick={addNoteAtTop} />
        </li>
        {children.map((child, i) => {
          const autoFocus = focusedNote.current === child.id;
          return (
            <li key={child.id}>
              {child.type === "note" ? (
                <>
                  <NoteCard note={child} autoFocus={autoFocus} />
                  <div
                    className="w-full h-2 hover:bg-blue-100"
                    onClick={() => {
                      const before = child;
                      const after = children[i + 1];
                      store.addNote({
                        listPositions:
                          list && hasPosition(before) && hasPosition(after)
                            ? [
                                {
                                  id: list.id,
                                  position: generatePositionBetween(
                                    before.position ?? null,
                                    after.position ?? null
                                  ),
                                },
                              ]
                            : [],
                      });
                    }}
                  />
                </>
              ) : (
                <div className="p-4">
                  <Link to={`/lists/${child.id}`}>
                    <h3 className="text-l font-bold">{child.name}</h3>
                    <div>...</div>
                  </Link>
                  {/* <div className="text-gray-600 text-sm">
                    <div>
                      {new Date(child.created_at).toLocaleString()} ({child.position})
                    </div>
                  </div> */}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export { ItemsColumn };

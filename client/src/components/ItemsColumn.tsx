import { generatePositionBetween, inputFocused, noModifiers, useHotkey } from "../lib/utils";
import { List, Note, hasPosition } from "../types";
import { NoteCard } from "./NoteCard";
import { useStoreContext } from "../lib/store";
import { useRef } from "react";
import { ListCard } from "./ListCard";
import { X } from "react-feather";

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

  const addListAtTop = () => {
    const top = children[0];
    return store.addList({
      name: Date.now().toString(),
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
    (e) => e.key === "l" && noModifiers(e) && !inputFocused(),
    () => !!addListAtTop()
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
    <div
      className="flex flex-col flex-1 basis-0 overflow-y-auto flex-col-reverse w-full px-4 items-center"
      onFocus={(e) => {
        const id = e.target.getAttribute("data-note-id");
        if (id) focusedNote.current = id;
      }}
      onBlur={() => (focusedNote.current = null)}
    >
      {/* spacer which pushes items to the top when there are few, and is padding at the bottom when there are many */}
      <div key="top-top" className="flex-1 min-h-32" />
      {children.map((child, i) => {
        const autoFocus = focusedNote.current === child.id;
        return (
          <div key={child.id} className="max-w-2xl w-full flex-0">
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
              <div className="flex gap-2">
                <ListCard list={child} />
                <button
                  onClick={() => {
                    if (!list) return;
                    store.removeItemFromList({ itemId: child.id, listId: list.id });
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        );
      })}
      <div key="top-bottom">
        <button className="w-full h-4 hover:bg-blue-100" onClick={addNoteAtTop} />
      </div>
    </div>
  );
}

export { ItemsColumn };

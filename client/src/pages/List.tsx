import { useNavigate, useParams } from "react-router-dom";
import { useList, useListChildren } from "../lib/hooks";
import { useStoreContext } from "../lib/store";
import {
  sortByPosition,
  generatePositionBetween,
  filterByText,
  noModifiers,
  inputFocused,
  useHotkey,
  sortByUpvotes,
} from "../lib/utils";
import { CreateButton } from "../components/CreateButton";
import { useSearchContext } from "../lib/SearchContext";
import { ItemsColumn } from "../components/ItemsColumn";
import { env } from "../lib/env";
import { useEffect, useRef } from "react";
import { useDisplayContext } from "../lib/DisplayContext";
import { CardListSelection } from "../components/CardListSelection";
import { Trash } from "react-feather";

export default function List() {
  const listId = useParams().id ?? "";
  const store = useStoreContext();
  const { search, clear } = useSearchContext();
  const { sort } = useDisplayContext();
  const list = useList(store, listId);
  const children = useListChildren(store, listId);
  const sortedChildren = filterByText(children, search.toLocaleLowerCase()).sort(
    sort === "position" ? sortByPosition : sortByUpvotes
  );
  const focusedNote = useRef<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    clear();
  }, [listId, clear]);

  const addNoteAtTop = () => {
    if (!list) return;
    return store.addNote({
      listPositions: [
        {
          id: list.id,
          position: generatePositionBetween(null, sortedChildren[0]?.position ?? null),
        },
      ],
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
      if (!list || !focusedNote.current) return;
      const i = sortedChildren.findIndex((child) => child.id === focusedNote.current);
      const before = sortedChildren[i]?.position ?? null;
      const after = sortedChildren[i + 1]?.position ?? null;
      const n = store.addNote({
        listPositions: [{ id: list.id, position: generatePositionBetween(before, after) }],
      });
      focusedNote.current = n.id;
    }
  );

  if (!list) {
    return <div>List not found</div>;
  }

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="relative border-b-2 border-gray-200 pb-2 flex">
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <p
              className="text-2xl font-bold flex-0"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const name = e.currentTarget.textContent;
                if (!name) return;
                store.updateList({ id: list.id, name });
              }}
              dangerouslySetInnerHTML={{ __html: list.name }}
            />
            <div className="flex gap-2 absolute top-0 right-0 transform translate-x-32 translate-y-1">
              <CardListSelection itemId={list.id} />
              <button
                onClick={() => {
                  store.deleteList(list.id);
                  navigate("/");
                }}
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className="flex flex-col flex-1 w-full"
        // Track focused note
        onFocus={(e) => {
          const id = e.target.getAttribute("data-note-id");
          if (id) focusedNote.current = id;
        }}
        onBlur={() => (focusedNote.current = null)}
      >
        <ItemsColumn children={sortedChildren} list={list} />
      </div>

      {env.isTouchDevice && <CreateButton onClick={addNoteAtTop} />}
    </div>
  );
}

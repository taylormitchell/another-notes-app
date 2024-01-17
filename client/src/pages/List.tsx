import { useParams } from "react-router-dom";
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
    <div className="flex flex-col w-full">
      <h1
        className="text-2xl font-bold text-center border-b-2 border-gray-200 pb-2"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const name = e.currentTarget.textContent;
          if (!name) return;
          store.updateList({ id: list.id, name });
        }}
        dangerouslySetInnerHTML={{ __html: list.name }}
      />
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

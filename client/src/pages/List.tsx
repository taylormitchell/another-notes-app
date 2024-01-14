import { Link, useParams } from "react-router-dom";
import { useList, useListChildren } from "../lib/hooks";
import { useStoreContext } from "../lib/store";
import {
  sortByPosition,
  generatePositionBetween,
  filterByText,
  noModifiers,
  inputFocused,
  useHotkey,
} from "../lib/utils";
import { NoteCard } from "../components/NoteCard";
import { CreateButton } from "../components/CreateButton";
import { useSearchContext } from "../lib/SearchContext";
import { ItemsColumn } from "../components/ItemsColumn";
import { env } from "../lib/env";
import { useEffect } from "react";

export default function List() {
  const listId = useParams().id ?? "";
  const store = useStoreContext();
  const { search, clear } = useSearchContext();
  const list = useList(store, listId);
  const children = useListChildren(store, listId);
  const sortedChildren = filterByText(children, search.toLocaleLowerCase()).sort(sortByPosition);

  useEffect(() => {
    clear();
  }, [listId, clear]);

  const addNoteAtTop = () => {
    if (!list) return;
    store.addNote({
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
      addNoteAtTop();
    }
  );

  if (!list) {
    return <div>List not found</div>;
  }

  return (
    <div>
      <h1
        className="text-2xl font-bold text-center"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const name = e.currentTarget.textContent;
          if (!name) return;
          store.updateList({ id: list.id, name });
        }}
        dangerouslySetInnerHTML={{ __html: list.name }}
      />
      <ItemsColumn>
        <li key="top-bottom">
          <button className="w-full h-4 hover:bg-blue-100" onClick={addNoteAtTop} />
        </li>
        {sortedChildren.map((child, i) => (
          <li key={child.id}>
            {child.type === "note" ? (
              <>
                <NoteCard note={child} position={child.position} />
                <div
                  className="w-full h-2 hover:bg-blue-100"
                  onClick={() => {
                    const before = child.position;
                    const after = sortedChildren[i + 1]?.position ?? null;
                    store.addNote({
                      listPositions: [
                        { id: list.id, position: generatePositionBetween(before, after) },
                      ],
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
                <div className="text-gray-600 text-sm">
                  <div>
                    {new Date(child.created_at).toLocaleString()} ({child.position})
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ItemsColumn>
      {env.isTouchDevice && <CreateButton onClick={addNoteAtTop} />}
    </div>
  );
}

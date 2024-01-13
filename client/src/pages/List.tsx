import { Link, useParams } from "react-router-dom";
import { useList, useListChildren } from "../lib/hooks";
import { useStoreContext } from "../lib/store";
import { sortByPosition, generatePositionBetween, filterByText } from "../lib/utils";
import { NoteCard } from "../components/NoteCard";
import { CreateButton } from "../components/CreateButton";
import { useSearchContext } from "../lib/SearchContext";
import { ItemsColumn } from "../components/ItemsColumn";

export default function List() {
  const listId = useParams().id ?? "";
  const store = useStoreContext();
  const search = useSearchContext().search.toLocaleLowerCase();
  const list = useList(store, listId);
  const children = useListChildren(store, listId);
  const sortedChildren = filterByText(children, search).sort(sortByPosition);

  if (!list) {
    return <div>List not found</div>;
  }

  const addNoteAtTop = () => {
    store.addNote({
      listPositions: [
        {
          id: list.id,
          position: generatePositionBetween(null, sortedChildren[0]?.position ?? null),
        },
      ],
    });
  };

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
          <li
            key={child.id}
            draggable="true"
            // onDragStart={(e) => {
            //   e.dataTransfer.setData("text/plain", child.id);
            // }}
            // onDrop={(e) => {
            //   // Swap positions
            //   e.preventDefault();
            //   const draggedNoteId = e.dataTransfer.getData("text/plain");
            //   const draggedNote = notes.find((n) => n.id === draggedNoteId);
            //   updatePosition({ id: draggedNoteId, type: child.type, position: child.position });
            //   updatePosition({ id: child.id, type: child.type, position: draggedNote.position });
            // }}
          >
            {child.type === "note" ? (
              <>
                <NoteCard note={child} position={child.position} />
                <button
                  className="w-full h-4 hover:bg-blue-100"
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
      <CreateButton onClick={addNoteAtTop} />
    </div>
  );
}

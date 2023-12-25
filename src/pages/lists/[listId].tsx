import { generatePositionBetween, sortByPosition } from "@/lib/utils";
import { useRouter } from "next/router";
import Link from "next/link";
import { useList, useListChildren } from "@/lib/hooks";
import { useStoreContext } from "@/lib/store";

export default function List() {
  const router = useRouter();
  const listId =
    typeof router.query.listId === "string" ? router.query.listId : router.query.listId?.[0] ?? "";
  const store = useStoreContext();
  const list = useList(store, listId);

  const sortedChildren = useListChildren(store, listId).sort(sortByPosition);
  console.log(sortedChildren);

  if (!list) {
    return <div>List not found</div>;
  }

  return (
    // center everything
    <div
      className="flex flex-col items-center"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          // get content of active element
          const el = document.activeElement as HTMLElement;
          const html = el.innerHTML;
          console.log(html);
          // console.log(text.at(-1) === "\n");
        }
      }}
    >
      {/* <button
        onClick={() => {
          // Previously, we ended up with duplicate positions that were messing with things.
          // Pressing this button fixes that.
          const newPositions = generateNKeysBetween(null, null, notes.length);
          Promise.all(
            notes.map((child, i) => {
              return updatePosition({ id: child.id, type: child.type, position: newPositions[i] });
            })
          );
        }}
      >
        Fix positions
      </button> */}
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

      <ul className="w-full space-y-4 p-4">
        <li key="top-bottom">
          <button
            className="w-full h-4 hover:bg-blue-100"
            onClick={() => {
              store.addNote({
                listPositions: [
                  {
                    id: list.id,
                    position: generatePositionBetween(null, sortedChildren[0]?.position ?? null),
                  },
                ],
              });
            }}
          />
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
                <div className="rounded overflow-hidden shadow-md bg-white">
                  <div
                    className="p-4"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const content = e.currentTarget.textContent ?? "";
                      store.updateNote({ id: child.id, content });
                    }}
                    // delete on backspace if empty
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && e.currentTarget.textContent === "") {
                        e.preventDefault();
                        store.deleteNote(child.id);
                      }
                    }}
                    dangerouslySetInnerHTML={{ __html: child.content }}
                  />
                  <div className="text-gray-600 text-sm">
                    <div>
                      {new Date(child.created_at).toLocaleString()} ({child.position})
                    </div>
                  </div>
                </div>
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
                <Link href={`/lists/${child.id}`}>
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
      </ul>
    </div>
  );
}

import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { uuid, generatePositionBetween, sortByPosition } from "../../lib/utils";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSetCachedListWithChildren, useListWithChildren, useCreateNote, useUpdateNote } from "@/lib/reactQueries";

type Note = {
  type: "note";
  id: string;
  created_at: string;
  content: string;
};

type List = {
  type: "list";
  id: string;
  name: string;
  created_at: string;
  children: ((Note & { position: string }) | (List & { position: string }))[];
};

function useCreateNoteInList(listId: string) {
  const setCachedListWithChildren = useSetCachedListWithChildren();

  const createNote = useCreateNote();
//   const { mutate: createNote } = useMutation(
//     async (note: { id: string; content: string; position: string; created_at: string }) => {
//       await axios.post("/api/db", [
//         {
//           query: `insert into note (id, content) values ($1, $2)`,
//           params: [note.id, note.content],
//         },
//         {
//           query: `insert into list_entries (parent_list_id, child_note_id, position) values ($1, $2, $3)`,
//           params: [listId, note.id, note.position],
//         },
//       ]);
//     },
//     {
//       onMutate: (note) => {
//         setCachedListWithChildren(listId, (list) => {
//           return {
//             ...list,
//             children: [...list.children, { ...note, type: "note" }],
//           };
//         });
//       },
//     }
//   );
  return ({ content = "", position }: { content?: string; position: string }) => {
    const note = { id: uuid(), content, position, created_at: new Date().toISOString() };
    createNote(note);
    return note;
  };
}

export default function List() {
  const router = useRouter();
  const listId =
    typeof router.query.listId === "string" ? router.query.listId : router.query.listId?.[0] ?? "";
  const queryClient = useQueryClient();
  const createNote = useCreateNote();

  const { data: list, isLoading } = useListWithChildren(listId);

  const { mutate: updateListName } = useMutation(
    async ({ id, name }: { id: string; name: string }) => {
      await axios.post("/api/db", [
        {
          query: `update list set name = $1 where id = $2`,
          params: [name, id],
        },
      ]);
    },
    {
      onMutate: ({ name }) => {
        const list = queryClient.getQueryData(["list", listId]) as List;
        queryClient.setQueryData(["list", listId], { ...list, name });
      },
    }
  );

  const createNoteInList = ({content, position}: {content?: string, position?: string}) => {
    return createNote({ content, listPositions: [{ id: listId, position }], })
  }
  const updateNote = useUpdateNote();



  const { mutate: updatePosition } = useMutation(
    async ({ id, type, position }: { id: string; type: "note" | "list"; position: string }) => {
      await axios.post("/api/db", [
        {
          query:
            type === "note"
              ? `update list_entries set position = $1 where child_note_id = $2`
              : `update list_entries set position = $1 where child_list_id = $2`,
          params: [position, id],
        },
      ]);
    },
    {
      onMutate: ({ id, position }) => {
        const list = queryClient.getQueryData(["list", listId]) as List;
        const updatedList = {
          ...list,
          child: list.children.map((c) => {
            if (c.type === "note" && c.id === id) {
              return { ...c, position };
            }
            return c;
          }),
        };
        queryClient.setQueryData(["list", listId], updatedList);
      },
    }
  );

  const { mutate: deleteNote } = useMutation(
    async (id: string) => {
      await axios.post("/api/db", [
        {
          query: `delete from note where id = $1`,
          params: [id],
        },
      ]);
    },
    {
      onMutate: (id) => {
        const list = queryClient.getQueryData<List>(["list", listId]);
        queryClient.setQueryData(["list", listId], {
          ...list,
          children: list.children.filter((c) => c.id !== id),
        });
      },
    }
  );

  if (isLoading || !list || list.type === "none") {
    console.log("List is loading", { isLoading, list })
    return <div>Loading...</div>;
  }

  // sort by position and created_at
  const sortedChildren = list.children.sort(sortByPosition);
  const lastPosition = sortedChildren.slice(-1)[0]?.position ?? null;

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
          const newPositions = generateNKeysBetween(null, null, sortedChildren.length);
          Promise.all(
            sortedChildren.map((child, i) => {
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
          updateListName({ id: list.id, name });
        }}
        dangerouslySetInnerHTML={{ __html: list.name }}
      />

      <ul className="w-full space-y-4 p-4">
        <li key="top-bottom">
          <button
            className="w-full h-4 hover:bg-blue-100"
            onClick={() => {
              createNoteInList({
                position: generatePositionBetween(null, sortedChildren[0]?.position ?? null),
              });
            }}
          />
        </li>
        {sortedChildren.map((child, i) => (
          <li
            key={child.id}
            draggable="true"
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", child.id);
            }}
            onDrop={(e) => {
              // Swap positions
              e.preventDefault();
              const draggedNoteId = e.dataTransfer.getData("text/plain");
              const draggedNote = sortedChildren.find((n) => n.id === draggedNoteId);
              updatePosition({ id: draggedNoteId, type: child.type, position: child.position });
              updatePosition({ id: child.id, type: child.type, position: draggedNote.position });
            }}
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
                      updateNote({ id: child.id, content });
                    }}
                    // delete on backspace if empty
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && e.currentTarget.textContent === "") {
                        e.preventDefault();
                        deleteNote(child.id);
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
                    createNoteInList({ position: generatePositionBetween(before, after) });
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

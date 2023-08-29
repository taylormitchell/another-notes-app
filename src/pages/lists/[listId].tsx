import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { generateKeyBetween } from "fractional-indexing";
import { uuid } from "../../lib/utils";
import { useRouter } from "next/router";
import Link from "next/link";

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

export default function List() {
  const router = useRouter();
  const listId = router.query.listId;
  const queryClient = useQueryClient();

  const { data: list } = useQuery<List>(["list", listId], async () => {
    const result = await axios.post("/api/db", [
      {
        query: `
          select 
            list.id, list.name, list.created_at, 
            list_entries.position, list_entries.child_note_id, 
            list_entries.child_list_id, 
            child_note.created_at child_note_created_at, child_note.content child_note_content,
            child_list.created_at child_list_created_at, child_list.name child_list_name
          from list 
          left join list_entries on list.id = list_entries.parent_list_id 
          left join note as child_note on list_entries.child_note_id = child_note.id 
          left join list as child_list on list_entries.child_list_id = child_list.id 
          where list.id = $1`,
        params: [listId],
      },
    ]);
    const data = result.data;
    console.log(data);
    const list: List = {
      type: "list",
      id: data[0].id,
      name: data[0].name,
      created_at: data[0].created_at,
      children: [],
    };
    data.forEach((row) => {
      if (row.child_note_id) {
        list.children.push({
          type: "note",
          id: row.child_note_id,
          created_at: row.child_note_created_at,
          content: row.child_note_content,
          position: row.position,
        });
      }
      if (row.child_list_id) {
        list.children.push({
          type: "list",
          id: row.child_list_id,
          created_at: row.child_list_created_at,
          name: row.child_list_name,
          position: row.position,
          children: [],
        });
      }
    });
    console.log(list);
    return list;
  });

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

  // const { data: notes, error } = useQuery<
  //   { id: string; content: string; created_at: string; position: string }[],
  //   any
  // >(["note", listId], async () => {
  //   const result = await axios.post("/api/db", [
  //     {
  //       query: `select note.*, list_entries.position from note join list_entries on note.id = list_entries.child_note_id where list_entries.parent_list_id = $1`,
  //       params: [listId],
  //     },
  //   ]);
  //   return result.data;
  // });

  const { mutate: createNote } = useMutation(
    async (note: { id: string; content: string; position: string }) => {
      await axios.post("/api/db", [
        {
          query: `insert into note (id, content) values ($1, $2)`,
          params: [note.id, note.content],
        },
        {
          query: `insert into list_entries (parent_list_id, child_note_id, position) values ($1, $2, $3)`,
          params: [listId, note.id, note.position],
        },
      ]);
    },
    {
      onMutate: (note) => {
        const list = queryClient.getQueryData(["list", listId]) as List;
        queryClient.setQueryData(["list", listId], {
          ...list,
          child: [...list.children, { type: "note", id: note.id, content: note.content }],
        });
      },
    }
  );

  const { mutate: updateNote } = useMutation(
    async ({ id, content }: { id: string; content: string }) => {
      await axios.post("/api/db", [
        {
          query: `update note set content = $1 where id = $2`,
          params: [content, id],
        },
      ]);
    },
    {
      onMutate: (note) => {
        const list = queryClient.getQueryData(["list", listId]) as List;
        const updatedList = {
          ...list,
          child: list.children.map((c) => {
            if (c.type === "note" && c.id === note.id) {
              return { ...c, content: note.content };
            }
            return c;
          }),
        };
        queryClient.setQueryData(["list", listId], updatedList);
      },
    }
  );

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
        const notes = queryClient.getQueryData(["note", listId]) as any[];
        const updatedNotes = notes.filter((n) => n.id !== id);
        queryClient.setQueryData(["note", listId], updatedNotes);
      },
    }
  );

  if (!list) return null;

  // sort by position and created_at
  const sortedChildren = list.children.sort((a, b) => {
    if (a.position === b.position) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return a.position > b.position ? 1 : -1;
  });
  const lastPosition = sortedChildren.slice(-1)[0]?.position ?? null;

  return (
    // center everything
    <div className="max-w-2xl mx-auto flex flex-col items-center">
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
      <ul className="space-y-4">
        {sortedChildren.map((child) => (
          <li
            key={child.id}
            className="max-w-lg mx-auto border border-gray-300 rounded cursor-pointer hover:bg-gray-100"
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
              <div className="rounded overflow-hidden shadow-md bg-white">
                <div
                  className="p-4"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const content = e.currentTarget.textContent;
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
              </div>
            ) : (
              <div className="p-4">
                <Link href={`/lists/${child.id}`}>
                  <h3 className="text-l font-bold">{child.name}</h3>
                  <div>...</div>
                </Link>
              </div>
            )}
          </li>
        ))}
      </ul>
      <button
        className="w-8 border border-black rounded-md my-4"
        onClick={() =>
          createNote({ id: uuid(), content: "", position: generateKeyBetween(lastPosition, null) })
        }
      >
        +
      </button>
    </div>
  );
}

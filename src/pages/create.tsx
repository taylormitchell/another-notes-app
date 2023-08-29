import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { generateKeyBetween, generateNKeysBetween } from "fractional-indexing";
import { uuid } from "../lib/utils";
import { useRef, useState } from "react";
import error from "next/error";

type AllLists = {
  [key: string]: {
    id: string;
    name: string;
    last_position: string;
  };
};

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

export default function Create() {
  const queryClient = useQueryClient();
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [newList, setNewList] = useState("");

  // Get all lists and, if they have any entries, the last positioned note in the list_entries table
  const { data: allLists } = useQuery<AllLists>("allLists", async () => {
    const result = await axios.post("/api/db", [
      {
        query: `select list.*, max(list_entries.position) last_position from list left join list_entries on list.id = list_entries.parent_list_id group by list.id`,
      },
    ]);
    return result.data.reduce((acc, { id, name, last_position }) => {
      acc[id] = { id, name, last_position: last_position ?? null };
      return acc;
    }, {});
  });

  const [listId, setList] = useState(uuid());
  const [firstNoteId, setFirstNote] = useState(uuid());
  // create list and first note
  const { data: list } = useQuery<List>(["create", listId], async () => {
    // create list, first note, add note to list_entries, and return list w/ notes
    const result = await axios.post("/api/db", [
      {
        query: `insert into list (id, name) values ($1, $2) on conflict do nothing`,
        params: [listId, ""],
      },
      {
        query: `insert into note (id, content) values ($1, $2) on conflict do nothing`,
        params: [firstNoteId, ""],
      },
      {
        query: `insert into list_entries (parent_list_id, child_note_id, position) values ($1, $2, $3) on conflict do nothing`,
        params: [listId, firstNoteId, generateKeyBetween(null, null)],
      },
      {
        query: `select * from list left join list_entries on list.id = list_entries.parent_list_id left join note on list_entries.child_note_id = note.id where list.id = $1`,
        params: [listId],
      },
    ]);
    const data = result.data;
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
    });
    return list;
  });

  const { mutate: updateList } = useMutation(
    async ({ id, name }: { id: string; name: string }) => {
      await axios.post("/api/db", [
        {
          query: `update list set name = $1 where id = $2`,
          params: [name, id],
        },
      ]);
    },
    {
      onMutate: (list) => {
        queryClient.setQueryData(["create", listId], list);
      },
    }
  );

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
        const list = queryClient.getQueryData(["create", listId]) as List;
        queryClient.setQueryData(["create", listId], {
          ...list,
          children: [...list.children, { ...note, type: "note" }],
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
        const list = queryClient.getQueryData(["create", listId]) as List;
        const updatedList = {
          ...list,
          children: list.children.map((c) => {
            if (c.type === "note" && c.id === note.id) {
              return { ...c, content: note.content };
            }
            return c;
          }),
        };
        queryClient.setQueryData(["create", listId], updatedList);
      },
    }
  );

  const { mutate: updatePosition } = useMutation(
    async ({ id, position }: { id: string; position: string }) => {
      await axios.post("/api/db", [
        {
          query: `update list_entries set position = $1 where child_note_id = $2`,
          params: [position, id],
        },
      ]);
    },
    {
      onMutate: (note) => {
        const list = queryClient.getQueryData(["create", listId]) as List;
        const updatedList = {
          ...list,
          children: list.children.map((c) => {
            if (c.type === "note" && c.id === note.id) {
              return { ...c, position: note.position };
            }
            return c;
          }),
        };
        queryClient.setQueryData(["create", listId], updatedList);
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
        const list = queryClient.getQueryData(["create", listId]) as List;
        const updatedList = {
          ...list,
          children: list.children.filter((c) => c.type === "note" && c.id !== id),
        };
        queryClient.setQueryData(["create", listId], updatedList);
      },
    }
  );

  // For each selected list, take all notes sorted by position and created_at,
  // generate new positions based on the list's last_position, and add them to the list_entries table
  const { mutate: addNotesToSelectedLists } = useMutation(
    async ({
      sortedChildren,
      selectedLists,
    }: {
      sortedChildren: { id: string }[];
      selectedLists: string[];
    }) => {
      const queries = [];
      selectedLists.map((listId) => {
        const lastPosition = allLists[listId].last_position;
        const positions = generateNKeysBetween(lastPosition, null, sortedChildren.length);
        for (let i = 0; i < sortedChildren.length; i++) {
          const note = sortedChildren[i];
          const position = positions[i];
          queries.push({
            query: `insert into list_entries (parent_list_id, child_note_id, position) values ($1, $2, $3)`,
            params: [listId, note.id, position],
          });
        }
      });
      await axios.post("/api/db", queries);
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
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const name = e.currentTarget.textContent;
          updateList({ id: list.id, name });
        }}
      >
        <h1>{list.name}</h1>
      </div>
      <ul className="space-y-4">
        {sortedChildren.map((note) =>
          note.type === "note" ? (
            <li
              key={note.id}
              className="max-w-lg mx-auto border border-gray-300 rounded cursor-pointer hover:bg-gray-100"
              draggable="true"
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", note.id);
              }}
              onDrop={(e) => {
                // Swap positions
                e.preventDefault();
                const draggedNoteId = e.dataTransfer.getData("text/plain");
                const draggedNote = sortedChildren.find((n) => n.id === draggedNoteId);
                updatePosition({ id: draggedNoteId, position: note.position });
                updatePosition({ id: note.id, position: draggedNote.position });
              }}
            >
              <div className="rounded overflow-hidden shadow-md bg-white">
                <div
                  className="p-4"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const content = e.currentTarget.textContent;
                    updateNote({ id: note.id, content });
                  }}
                  // delete on backspace if empty
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && e.currentTarget.textContent === "") {
                      e.preventDefault();
                      deleteNote(note.id);
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              </div>
            </li>
          ) : null
        )}
      </ul>
      <button
        className="w-8 border border-black rounded-md my-4"
        onClick={() =>
          createNote({ id: uuid(), content: "", position: generateKeyBetween(lastPosition, null) })
        }
      >
        +
      </button>
      <div>
        <div className="flex flex-row flex-wrap">
          {selectedLists
            .map((id) => allLists[id])
            .map((list) => (
              <span className="bg-blue-200 rounded px-2 py-1 m-1 flex items-center" key={list.id}>
                {list.name}
                <button
                  className="ml-2 text-sm text-red-500"
                  onClick={() => setSelectedLists((lists) => lists.filter((t) => t !== list.id))}
                >
                  x
                </button>
              </span>
            ))}
        </div>
        <input
          ref={inputRef}
          type="text"
          className="border rounded p-1 m-1"
          defaultValue={newList}
          onChange={(e) => setNewList(e.target.value)}
          placeholder="Add a new list..."
        />
        {newList && (
          <div className="absolute bg-white border rounded mt-1">
            {Object.values(allLists)
              .filter((list) => !selectedLists.includes(list.id))
              .filter((list) => list.name.toLocaleLowerCase().includes(newList.toLocaleLowerCase()))
              .map((list) => (
                <div
                  key={list.id}
                  className="p-1 hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setSelectedLists((lists) => [...lists, list.id]);
                    setNewList("");
                    if (inputRef.current) {
                      inputRef.current.value = "";
                    }
                  }}
                >
                  {list.name}
                </div>
              ))}
          </div>
        )}
      </div>
      <button
        onClick={() => {
          addNotesToSelectedLists({ sortedChildren, selectedLists });
          setList(uuid());
        }}
      >
        Submit
      </button>
    </div>
  );
}

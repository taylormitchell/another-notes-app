import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { generateKeyBetween } from "fractional-indexing";
import { uuid } from "../../lib/utils";
import { useRouter } from "next/router";

export default function List() {
  const router = useRouter();
  const listId = router.query.listId;
  const queryClient = useQueryClient();

  const { data: list } = useQuery<{ id: string; name: string }>(["list", listId], async () => {
    const result = await axios.post("/api/db", [
      {
        query: `select * from list where id = $1`,
        params: [listId],
      },
    ]);
    return result.data[0];
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
      onMutate: (list) => {
        queryClient.setQueryData(["list", listId], list);
        queryClient.invalidateQueries("lists");
      },
    }
  );

  const { data: notes, error } = useQuery<
    { id: string; content: string; created_at: string; position: string }[],
    any
  >(["note", listId], async () => {
    const result = await axios.post("/api/db", [
      {
        query: `select note.*, list_entries.position from note join list_entries on note.id = list_entries.note_id where list_entries.list_id = $1`,
        params: [listId],
      },
    ]);
    return result.data;
  });

  const { mutate: createNote } = useMutation(
    async (note: { id: string; content: string; position: string }) => {
      await axios.post("/api/db", [
        {
          query: `insert into note (id, content) values ($1, $2)`,
          params: [note.id, note.content],
        },
        {
          query: `insert into list_entries (list_id, note_id, position) values ($1, $2, $3)`,
          params: [listId, note.id, note.position],
        },
      ]);
    },
    {
      onMutate: (note) => {
        const notes = queryClient.getQueryData(["note", listId]) as any[];
        queryClient.setQueryData(["note", listId], [...notes, note]);
      },
      onError: () => {
        queryClient.invalidateQueries(["note", listId]);
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
        const notes = queryClient.getQueryData(["note", listId]) as any[];
        const updatedNotes = notes.map((n) => {
          if (n.id === note.id) {
            return { ...n, ...note };
          }
          return n;
        });
        queryClient.setQueryData(["note", listId], updatedNotes);
      },
    }
  );

  const { mutate: updatePosition } = useMutation(
    async ({ id, position }: { id: string; position: string }) => {
      await axios.post("/api/db", [
        {
          query: `update list_entries set position = $1 where note_id = $2`,
          params: [position, id],
        },
      ]);
    },
    {
      onMutate: (note) => {
        const notes = queryClient.getQueryData(["note", listId]) as any[];
        const updatedNotes = notes.map((n) => {
          if (n.id === note.id) {
            return { ...n, ...note };
          }
          return n;
        });
        queryClient.setQueryData(["note", listId], updatedNotes);
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

  if (!notes || !list) return null;
  if (error) return <div>{error}</div>;

  // sort by position and created_at
  const sortedNotes = notes.sort((a, b) => {
    if (a.position === b.position) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return a.position > b.position ? 1 : -1;
  });
  const lastPosition = sortedNotes.slice(-1)[0]?.position ?? null;

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
        {notes.map((note) => (
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
              const draggedNote = notes.find((n) => n.id === draggedNoteId);
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
      {/* <div>{JSON.stringify(notes, null, 2)}</div> */}
    </div>
  );
}
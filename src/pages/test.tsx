import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { uuid } from "../lib/utils";
import { generateKeyBetween } from "fractional-indexing";

export default function Test() {
  const tagId = "6ad18bda-10fd-404b-91c3-274cf58cb0ce";
  const queryClient = useQueryClient();

  const { data: tag } = useQuery<{ id: string; name: string }>(["tag", tagId], async () => {
    const result = await axios.post("/api/db", [
      {
        query: `select * from tag where id = $1`,
        params: [tagId],
      },
    ]);
    return result.data[0];
  });

  const { data: notes, error } = useQuery<
    { id: string; content: string; created_at: string; position: string }[],
    any
  >(["note", tagId], async () => {
    const result = await axios.post("/api/db", [
      {
        query: `select note.*, tag_entries.position from note join tag_entries on note.id = tag_entries.note_id where tag_entries.tag_id = $1`,
        params: [tagId],
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
          query: `insert into tag_entries (tag_id, note_id, position) values ($1, $2, $3)`,
          params: [tagId, note.id, note.position],
        },
      ]);
    },
    {
      onMutate: (note) => {
        const notes = queryClient.getQueryData(["note", tagId]) as any[];
        queryClient.setQueryData(["note", tagId], [...notes, note]);
      },
      onError: () => {
        queryClient.invalidateQueries(["note", tagId]);
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
        const notes = queryClient.getQueryData(["note", tagId]) as any[];
        const updatedNotes = notes.map((n) => {
          if (n.id === note.id) {
            return { ...n, ...note };
          }
          return n;
        });
        queryClient.setQueryData(["note", tagId], updatedNotes);
      },
    }
  );

  const { mutate: updatePosition } = useMutation(
    async ({ id, position }: { id: string; position: string }) => {
      await axios.post("/api/db", [
        {
          query: `update tag_entries set position = $1 where note_id = $2`,
          params: [position, id],
        },
      ]);
    },
    {
      onMutate: (note) => {
        const notes = queryClient.getQueryData(["note", tagId]) as any[];
        const updatedNotes = notes.map((n) => {
          if (n.id === note.id) {
            return { ...n, ...note };
          }
          return n;
        });
        queryClient.setQueryData(["note", tagId], updatedNotes);
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
        const notes = queryClient.getQueryData(["note", tagId]) as any[];
        const updatedNotes = notes.filter((n) => n.id !== id);
        queryClient.setQueryData(["note", tagId], updatedNotes);
      },
    }
  );

  if (!notes || !tag) return null;
  if (error) return <div>{error}</div>;

  // sort by position and created_at
  const sortedNotes = notes.sort((a, b) => {
    if (a.position === b.position) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return a.position > b.position ? 1 : -1;
  });
  const lastPosition = sortedNotes.slice(-1)[0].position;

  return (
    // center everything
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      <h1 className="text-2xl font-bold text-center">{tag.name}</h1>
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

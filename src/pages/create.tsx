import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { generateKeyBetween, generateNKeysBetween } from "fractional-indexing";
import { uuid } from "../lib/utils";
import { useRef, useState } from "react";

type Tag = {
  id: string;
  name: string;
  last_position: string;
};

export default function Create() {
  const queryClient = useQueryClient();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [newTag, setNewTag] = useState("");

  // Get all tags and, if they have any entries, the last positioned note in the tag_entries table
  const { data: allTags } = useQuery<{ [key: string]: Tag }>("allTags", async () => {
    const result = await axios.post("/api/db", [
      {
        query: `select tag.*, max(tag_entries.position) last_position from tag left join tag_entries on tag.id = tag_entries.tag_id group by tag.id`,
      },
    ]);
    return result.data.reduce((acc, { id, name, last_position }) => {
      acc[id] = { id, name, last_position: last_position ?? null };
      return acc;
    }, {});
  });

  const [tagId, setTag] = useState(uuid());
  const { data: tag } = useQuery<{ id: string; name: string }>(["create", tagId], async () => {
    const result = await axios.post("/api/db", [
      {
        query: `insert into tag (id, name) values ($1, $2) on conflict (id) do nothing returning *`,
        params: [tagId, Date.now().toString()],
      },
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

  // For each selected tag, take all notes sorted by position and created_at,
  // generate new positions based on the tag's last_position, and add them to the tag_entries table
  const { mutate: addNotesToSelectedTags } = useMutation(
    async ({
      sortedNotes,
      selectedTags,
    }: {
      sortedNotes: { id: string }[];
      selectedTags: string[];
    }) => {
      const queries = [];
      selectedTags.map((tagId) => {
        const lastPosition = allTags[tagId].last_position;
        const positions = generateNKeysBetween(lastPosition, null, sortedNotes.length);
        for (let i = 0; i < sortedNotes.length; i++) {
          const note = sortedNotes[i];
          const position = positions[i];
          queries.push({
            query: `insert into tag_entries (tag_id, note_id, position) values ($1, $2, $3)`,
            params: [tagId, note.id, position],
          });
        }
      });
      await axios.post("/api/db", queries);
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
  const lastPosition = sortedNotes.slice(-1)[0]?.position ?? null;

  return (
    // center everything
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      <div>
        <h1>Tags</h1>
        <div className="flex flex-row flex-wrap">
          {selectedTags
            .map((id) => allTags[id])
            .map((tag) => (
              <span className="bg-blue-200 rounded px-2 py-1 m-1 flex items-center" key={tag.id}>
                {tag.name}
                <button
                  className="ml-2 text-sm text-red-500"
                  onClick={() => setSelectedTags((tags) => tags.filter((t) => t !== tag.id))}
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
          defaultValue={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add a new tag..."
        />
        {newTag && (
          <div className="absolute bg-white border rounded mt-1">
            {Object.values(allTags)
              .filter((tag) => !selectedTags.includes(tag.id))
              .filter((tag) => tag.name.toLocaleLowerCase().includes(newTag.toLocaleLowerCase()))
              .map((tag) => (
                <div
                  key={tag.id}
                  className="p-1 hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setSelectedTags((tags) => [...tags, tag.id]);
                    setNewTag("");
                    if (inputRef.current) {
                      inputRef.current.value = "";
                    }
                  }}
                >
                  {tag.name}
                </div>
              ))}
          </div>
        )}
      </div>
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
      <button
        onClick={() => {
          addNotesToSelectedTags({ sortedNotes, selectedTags });
          setTag(uuid());
        }}
      >
        Submit
      </button>
    </div>
  );
}

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { generateKeyBetween } from "fractional-indexing";
import { useRouter } from "next/router";
import { uuid } from "../lib/utils";
import { useRef, useState } from "react";

type Tag = {
  id: string;
  name: string;
};

type TagWithLastPosition = Tag & { lastPosition: string };

type Note = {
  id: string;
  content: string;
  created_at: string;
  position: string; // position in the hidden tag
  otherTagPositions: { tagId: string; position: string }[];
};

// export default function Create({ tagId = "64b9c132-006c-4302-a3d1-f7254429808a" }: { tagId: string }) {
export default function Create() {
  const hiddenTag = "64b9c132-006c-4302-a3d1-f7254429808a";
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [newTag, setNewTag] = useState("");
  const queryClient = useQueryClient();

  // Get all tags and, if they have any entries, the last positioned note in the tag_entries table
  const { data: allTags } = useQuery<{ [key: string]: TagWithLastPosition }>(
    "allTags",
    async () => {
      const result = await axios.post("/api/db", [
        {
          query: `select tag.*, max(tag_entries.position) last_position from tag left join tag_entries on tag.id = tag_entries.tag_id group by tag.id`,
        },
      ]);
      return result.data.reduce((acc, { id, name, last_position }) => {
        acc[id] = { id, name, lastPosition: last_position ?? null };
        return acc;
      }, {});
    }
  );

  const { data: notes, isLoading: notesLoading } = useQuery<Note[], any>(
    ["note", hiddenTag],
    async () => {
      const result = await axios.post("/api/db", [
        {
          query: `select note.*, tag_entries.position from note join tag_entries on note.id = tag_entries.note_id where tag_entries.tag_id = $1`,
          params: [hiddenTag],
        },
      ]);
      return result.data.map((row) => {
        const note: Note = {
          id: row.id,
          content: row.content,
          created_at: row.created_at,
          position: row.position,
          otherTagPositions: [],
        };
        return note;
      });
    }
  );

  const { mutate: createNote } = useMutation(
    async (note: {
      id: string;
      content: string;
      position: string;
      created_at: string;
      otherTagPositions: { tagId: string; position: string }[];
    }) => {
      await axios.post("/api/db", [
        {
          query: `insert into note (id, content, created_at) values ($1, $2, $3)`,
          params: [note.id, note.content, note.created_at],
        },
        [...note.otherTagPositions, { tagId: hiddenTag, position: note.position }].map(
          ({ tagId, position }) => ({
            query: `insert into tag_entries (tag_id, note_id, position) values ($1, $2, $3)`,
            params: [tagId, note.id, position],
          })
        ),
      ]);
    },
    {
      onMutate: (note) => {
        const notes = queryClient.getQueryData(["note", hiddenTag]) as any[];
        queryClient.setQueryData(["note", hiddenTag], [...notes, note]);
      },
      onError: () => {
        queryClient.invalidateQueries(["note", hiddenTag]);
      },
    }
  );

  if (!allTags || notesLoading) return null;

  const sortedNotes = notes.sort((a, b) => {
    if (a.position === b.position) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return a.position > b.position ? 1 : -1;
  });
  console.log(sortedNotes);

  // lastPosition in each of the selected tags. If sortedNotes is empty, it will be the lastPosition
  // in the allTags object. Otherwise, it will be the lastPosition in the sortedNotes array.
  let lastPositions: { [key: string]: string } = {};
  const lastNote = sortedNotes.slice(-1)[0];
  if (!lastNote) {
    lastPositions = selectedTags.reduce((acc, tagId) => {
      acc[tagId] = allTags[tagId].lastPosition;
      return acc;
    }, {});
    lastPositions[hiddenTag] = allTags[hiddenTag].lastPosition;
  } else {
    lastPositions = lastNote.otherTagPositions.reduce((acc, { tagId, position }) => {
      acc[tagId] = position;
      return acc;
    }, {});
    lastPositions[hiddenTag] = lastNote.position;
  }
  console.log(lastPositions);

  //   const lastPosition = sortedNotes.slice(-1)[0]?.position ?? null;

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      <div>
        <h1>Tags</h1>
        <span>Hidden tag: {hiddenTag}</span>
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
              .filter((tag) => tag.name.includes(newTag))
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
            // onDragStart={(e) => {
            //   e.dataTransfer.setData("text/plain", note.id);
            // }}
            // onDrop={(e) => {
            //   // Swap positions
            //   e.preventDefault();
            //   const draggedNoteId = e.dataTransfer.getData("text/plain");
            //   const draggedNote = notes.find((n) => n.id === draggedNoteId);
            //   updatePosition({ id: draggedNoteId, position: note.position });
            //   updatePosition({ id: note.id, position: draggedNote.position });
            // }}
          >
            <div className="rounded overflow-hidden shadow-md bg-white">
              <div
                className="p-4"
                contentEditable
                suppressContentEditableWarning
                // onBlur={(e) => {
                //   const content = e.currentTarget.textContent;
                //   updateNote({ id: note.id, content });
                // }}
                // // delete on backspace if empty
                // onKeyDown={(e) => {
                //   if (e.key === "Backspace" && e.currentTarget.textContent === "") {
                //     e.preventDefault();
                //     deleteNote(note.id);
                //   }
                // }}
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            </div>
          </li>
        ))}
      </ul>
      <button
        className="w-8 border border-black rounded-md my-4"
        onClick={() =>
          //   createNote({ id: uuid(), content: "", position: generateKeyBetween(lastPosition, null) })
          createNote({
            id: uuid(),
            content: "",
            created_at: new Date().toISOString(),
            position: generateKeyBetween(lastPositions[hiddenTag], null),
            otherTagPositions: selectedTags.map((tagId) => ({
              tagId,
              position: generateKeyBetween(lastPositions[tagId], null),
            })),
          })
        }
      >
        +
      </button>
    </div>
  );
}

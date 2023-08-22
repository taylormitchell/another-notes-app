import error from "next/error";
import router, { useRouter } from "next/router";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { supabase } from "../../lib/supabase";
import { uuid } from "../../lib/utils";
import { useEffect } from "react";
import { generateKeyBetween } from "fractional-indexing";

// sort ascending by position and then by created_at
function sortNotes(
  a: { position: string; created_at: Date },
  b: { position: string; created_at: Date }
) {
  if (a.position === b.position) {
    return a.created_at > b.created_at ? 1 : -1;
  }
  return a.position > b.position ? 1 : -1;
}

const Tag = () => {
  const router = useRouter();
  const tagId = router.query.tagId;
  const queryClient = useQueryClient();

  const { data: tag, isLoading } = useQuery(
    ["tag", tagId],
    async () => {
      const { data, error } = await supabase.from("tags").select("*").filter("id", "eq", tagId);
      if (error) throw error;
      return data[0];
    },
    { enabled: !!tagId }
  );

  const { data: notes } = useQuery(
    ["tagNotes", tagId],
    async () => {
      const { data, error } = await supabase
        .from("tag_entries")
        .select("note_id, position, note:notes(id, content, created_at)")
        .eq("tag_id", tagId)
        .order("position", { ascending: true });
      if (error) throw error;
      console.log({ data });
      return data.map((d) => ({
        id: d.note_id,
        position: d.position,
        content: d.note.content,
        created_at: d.note.created_at,
      }));
    },
    { enabled: !!tagId }
  );

  const createNote = useMutation(
    async ({ id, content, position }: { id: string; content: string; position: string }) => {
      await supabase.from("notes").insert({ id, content });
      await supabase.from("tag_entries").insert({ tag_id: tagId, note_id: id, position });
    },
    {
      onMutate: (note) => {
        const notes = queryClient.getQueryData(["tagNotes", tagId]) as any[];
        queryClient.setQueryData(["tagNotes", tagId], [...notes, note]);
      },
    }
  );

  const updateNote = useMutation(
    async ({ id, content }: { id: string; content: string }) => {
      await supabase.from("notes").update({ content }).match({ id });
    },
    {
      onMutate: (note) => {
        const notes = queryClient.getQueryData(["tagNotes", tagId]) as any[];
        const updatedNotes = notes.map((n) => {
          if (n.id === note.id) {
            return { ...n, ...note };
          }
          return n;
        });
        queryClient.setQueryData(["tagNotes", tagId], updatedNotes);
      },
    }
  );

  // Create a new note if there are no notes
  useEffect(() => {
    if (notes === undefined || notes.length > 0) return;
    const lastPos = notes.sort(sortNotes).slice(-1)[0]?.position ?? null;
    createNote.mutate({ id: uuid(), content: "", position: generateKeyBetween(null, lastPos) });
  }, [notes]);

  if (isLoading || !tag || !notes) return null;

  const sortedNotes = notes.sort(sortNotes);

  return (
    <div>
      <h1>Tag: {tag.name}</h1>
      <h2>Notes:</h2>
      {sortedNotes.map((note) => (
        <div className="border border-black" key={note.id}>
          {/* Use an input area for the content, which is set to the current, and mutates the note whenever the input is submitted or blurred*/}
          <span>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateNote.mutate({ id: note.id, content: e.currentTarget.content.value });
              }}
              onBlur={(e) => {
                e.preventDefault();
                updateNote.mutate({ id: note.id, content: e.currentTarget.content.value });
              }}
            >
              <input type="text" defaultValue={note.content} id="content" />
            </form>
            <span>pos: {note.position}</span>
          </span>
        </div>
      ))}
      <button
        onClick={async () => {
          createNote.mutate({
            id: uuid(),
            content: "",
            position: generateKeyBetween(sortedNotes.slice(-1)[0].position, null),
          });
        }}
      >
        Create new note
      </button>
    </div>
  );
};

export default Tag;

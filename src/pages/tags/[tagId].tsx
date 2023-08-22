import error from "next/error";
import router, { useRouter } from "next/router";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { supabase } from "../../lib/supabase";
import { uuid } from "../../lib/utils";
import { useEffect, useState } from "react";
import { generateKeyBetween } from "fractional-indexing";
import e from "express";

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
  const [nextSelected, setNextSelected] = useState<string>("");

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

  const deleteNote = useMutation(
    async (id: string) => {
      await supabase.from("notes").delete().match({ id });
    },
    {
      onMutate: (id) => {
        const notes = queryClient.getQueryData(["tagNotes", tagId]) as any[];
        const updatedNotes = notes.filter((n) => n.id !== id);
        queryClient.setQueryData(["tagNotes", tagId], updatedNotes);
      },
    }
  );

  const updateTagName = useMutation(
    async (name: string) => {
      await supabase.from("tags").update({ name }).match({ id: tagId });
    },
    {
      onMutate: (name) => {
        const tag = queryClient.getQueryData(["tag", tagId]) as any;
        queryClient.setQueryData(["tag", tagId], { ...tag, name });
      },
    }
  );

  useEffect(() => {
    if (nextSelected === "") return;
    setTimeout(() => {
      const el = document.querySelector(`[data-id="${nextSelected}"] .content`) as HTMLInputElement;
      if (!el) return;
      el.focus();
      setNextSelected("");
    }, 0);
  }, [nextSelected]);

  // Create a new note if there are no notes
  useEffect(() => {
    if (notes === undefined || notes.length > 0) return;
    const lastPos = notes.sort(sortNotes).slice(-1)[0]?.position ?? null;
    createNote.mutate({ id: uuid(), content: "", position: generateKeyBetween(null, lastPos) });
  }, [notes]);

  if (isLoading || !tag || !notes) return null;

  const sortedNotes = notes.sort(sortNotes);

  return (
    <div className="w100">
      <div>
        <span>Tag: </span>
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            const name = e.currentTarget.textContent;
            updateTagName.mutate(name);
          }}
        >
          {tag.name}
        </span>
      </div>
      <div className="flex flex-col align-center">
        <button
          onClick={async (e) => {
            e.preventDefault();
            const id = uuid();
            const position = generateKeyBetween(null, sortedNotes[0]?.position);
            createNote.mutate({ id, content: "", position });
            setNextSelected(id);
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          +
        </button>
        {sortedNotes.map((note, i) => (
          <div key={note.id} data-id={note.id} className="flex flex-col align-center">
            <div className="flex flex-row w-full">
              <div
                className="border border-black flex-grow content"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const content = e.currentTarget.textContent;
                  updateNote.mutate({ id: note.id, content });
                }}
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
              <button className="flex-shrink-0 w-8" onClick={() => deleteNote.mutate(note.id)}>
                x
              </button>
            </div>
            <button
              onClick={async (e) => {
                e.preventDefault();
                const id = uuid();
                const position = generateKeyBetween(note.position, sortedNotes[i + 1]?.position);
                createNote.mutate({ id, content: "", position });
                setNextSelected(id);
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tag;

import React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { createClient } from "@supabase/supabase-js";
import { uuid } from "../../lib/utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Notes: React.FC = () => {
  const { data: notes, isLoading } = useQuery("notes", async () => {
    const { data, error } = await supabase.from("notes").select();
    if (error) throw error;
    return data;
  });

  // create a new note
  const queryClient = useQueryClient();
  const createNote = useMutation(
    async (note: { id: string; content: string; created_at: Date }) => {
      await supabase.from("notes").insert(note);
    },
    {
      onMutate: (note) => {
        const notes = queryClient.getQueryData("notes") as any[];
        console.log(note);
        queryClient.setQueryData("notes", [...notes, note]);
      },
    }
  );

  const updateNote = useMutation(
    async ({ id, content }: { id: string; content: string }) => {
      await supabase.from("notes").update({ content }).match({ id });
    },
    {
      onMutate: (note) => {
        const notes = queryClient.getQueryData("notes") as any[];
        const updatedNotes = notes.map((n) => {
          if (n.id === note.id) {
            return note;
          }
          return n;
        });
        queryClient.setQueryData("notes", updatedNotes);
      },
    }
  );

  if (isLoading) return <p>Loading...</p>;
  return (
    <div>
      <div>
        {notes
          .sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
          .map((note) => (
            <div key={note.id}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const content = (e.target as any).content.value;
                  updateNote.mutate({ id: note.id, content });
                }}
              >
                <input type="text" defaultValue={note.content} id="content" />
              </form>
            </div>
          ))}
      </div>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const content = (e.target as any).content.value;
            createNote.mutate({ id: uuid(), content, created_at: new Date() });
            e.currentTarget.reset();
          }}
        >
          <input type="text" name="content" />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default () => {
  return (
    <div>
      <h2>My Notes:</h2>
      <Notes />
    </div>
  );
};

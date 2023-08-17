import { useState } from "react";
import notes, { postNoteResponse } from "./api/notes";
import axios from "axios";
import lists from "./lists";
import { NoteWithRelations } from "../../types";
import { postNotesRequest } from "./api/notes";
import { useAuth } from "../components/useAuth";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchNotes } from "./notes";
import { Note } from "@prisma/client";
// import { useCreateNoteMutation } from "../types/graphql";
import { v4 as uuid } from "uuid";

export async function createNote(props: postNotesRequest): Promise<NoteWithRelations> {
  const { data } = await axios.post<postNoteResponse>("/api/notes", props);
  if (!data) throw new Error("No data");
  if (data.error) throw new Error(data.error);
  return data.value;
}

export async function updateNote(props: { id: string; text: string }): Promise<NoteWithRelations> {
  const { id, ...rest } = props;
  const { data } = await axios.put<postNoteResponse>(`/api/notes/${id}`, rest);
  if (!data) throw new Error("No data");
  if (data.error) throw new Error(data.error);
  return data.value;
}

export default () => {
  const { user } = useAuth();
  const { data: notes, error, isLoading, refetch } = useQuery("notes", fetchNotes);

  const [notesOnPage, setNotesOnPage] = useState<string[]>(["4"]);

  const queryClient = useQueryClient();
  const notesQuery = queryClient.getQueryData<Note[]>("notes");

  const createMutation = useMutation(createNote, {
    // Optimistic update
    onMutate: (note) => {
      // Update the cache with the optimistic response
      queryClient.setQueryData("notes", [...notesQuery, note]);
    },
    // Callback to refetch notes after a successful mutation
    onSuccess: () => {
      queryClient.invalidateQueries("notes");
    },
  });

  const updateMutation = useMutation(updateNote, {
    // Optimistic update
    onMutate: (note) => {
      // Update the cache with the optimistic response
      queryClient.setQueryData(
        "notes",
        notesQuery.map((n) => (n.id === note.id ? { ...n, ...note } : n))
      );
    },
    // Callback to refetch notes after a successful mutation
    onSuccess: () => {
      queryClient.invalidateQueries("notes");
    },
  });

  function addNote() {
    const id = uuid();
    createMutation.mutate({ id, text: "", author: user.id });
    setNotesOnPage([...notesOnPage, id]);
  }

  function handleUpdateNote(id: string, text: string) {
    updateMutation.mutate({ id, text });
  }

  // form to create a new note
  return (
    <div>
      <div>
        <h1>Notes</h1>
        {isLoading && <div>Loading...</div>}
        {notes &&
          notes
            .filter((n) => notesOnPage.includes(n.id))
            .sort((a, b) => notesOnPage.indexOf(a.id) - notesOnPage.indexOf(b.id))
            .map((note) => (
              <div style={{ border: "1px solid black", padding: "1rem" }} key={note.id}>
                <input
                  className="border-2 border-gray-300 w-full"
                  type="text"
                  defaultValue={note.text}
                  onChange={(e) => {
                    handleUpdateNote(note.id, e.target.value);
                  }}
                />
              </div>
            ))}
      </div>
      <button onClick={addNote}>Add note</button>
      {/* <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const text = (e.target as any).text.value;
            createNote({ text, author: user.id });
            e.currentTarget.reset();
          }}
        >
          <div className="flex flex-col items-start">
            <input className="border-2 border-gray-300 w-full" type="text" name="text" />
            <button type="submit">Save</button>
          </div>
        </form>
      </div> */}
    </div>
  );
};

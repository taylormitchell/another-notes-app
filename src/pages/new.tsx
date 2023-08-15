import { useState } from "react";
import notes, { postNoteResponse } from "./api/notes";
import axios from "axios";
import lists from "./lists";
import { NoteWithRelations } from "../../types";
import { postNotesRequest } from "./api/notes";
import { useAuth } from "../components/useAuth";
// import { useCreateNoteMutation } from "../types/graphql";

export async function createNote(props: postNotesRequest): Promise<NoteWithRelations> {
  const { data } = await axios.post<postNoteResponse>("/api/notes", props);
  if (!data) throw new Error("No data");
  if (data.error) throw new Error(data.error);
  return data.value;
}

export default () => {
  const { user } = useAuth();
  // form to create a new note
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const text = (e.target as any).text.value;
          createNote({ text, author: user.id });
          e.currentTarget.reset();
        }}
      >
        <label>
          Text:
          <input type="text" name="text" />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

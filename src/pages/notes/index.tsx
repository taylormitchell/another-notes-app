import React from "react";
import Link from "next/link";
import { getNotesResponse } from "../api/notes";
import axios from "axios";
import { NoteWithRelations } from "../../../types";
import { useQuery } from "react-query";

async function fetchNotes(): Promise<NoteWithRelations[]> {
  const { data } = await axios.get<getNotesResponse>("/api/notes");
  if (!data) throw new Error("No data");
  if (data.error) throw new Error(data.error);
  return data.value;
}

const Notes: React.FC = () => {
  const { data: notes, error, isLoading, refetch } = useQuery("notes", fetchNotes);

  if (error) return <p>Error :(</p>;
  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      {notes.map((note) => (
        <div key={note.id}>
          <Link href={`/notes/${note.id}`}>{note.text}</Link>
        </div>
      ))}
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

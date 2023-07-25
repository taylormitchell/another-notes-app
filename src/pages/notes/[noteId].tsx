import { useRouter } from "next/router";
import { getNoteResponse } from "../api/notes/[id]";
import axios from "axios";
import { useQuery } from "react-query";

async function getNoteById(id: number) {
  const { data } = await axios.get<getNoteResponse>(`/api/notes/${id}`);
  if (!data) throw new Error("No data");
  if (data.error) throw new Error(data.error);
  return data.value;
}

export default () => {
  const router = useRouter();
  const id = parseInt(typeof router.query.noteId === "string" ? router.query.noteId : "-1");

  const { data: note, error, isLoading } = useQuery(["note", id], () => getNoteById(id));

  if (isLoading) return <p>Loading...</p>;
  if (error) {
    console.error(error);
    return (
      <div>
        <p>Error :(</p>
        <p>{String(error)}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>id: {note.id}</h2>
      <p>text: {note.text}</p>
      <p>relatedLists: {note.relatedLists.map((l) => l.name).join(", ")}</p>
      <p>relatedNotes: {note.relatedNotes.map((n) => n.text).join(", ")}</p>
    </div>
  );
};

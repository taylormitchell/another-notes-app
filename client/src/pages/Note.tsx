import { useParams } from "react-router-dom";
import { useNote } from "../lib/hooks";
import { useStoreContext } from "../lib/store";
import { NoteCard } from "../components/NoteCard";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";

export default function Note() {
  const noteId = useParams().id ?? "";
  const store = useStoreContext();
  const note = useNote(store, noteId);
  if (!note) {
    return <div>Note not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      <Header>
        <Sidebar />
      </Header>
      <div className="w-full">
        <NoteCard note={note} />
      </div>
    </div>
  );
}

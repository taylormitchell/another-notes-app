import { useNotes } from "../lib/hooks";
import { useStoreContext } from "../lib/store";
import { CreateButton } from "../components/CreateButton";
import { NoteCard } from "../components/NoteCard";

export default function Notes() {
  const store = useStoreContext();
  const notes = useNotes(store);
  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      <ul className="w-full space-y-4 p-4">
        {notes
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((note) => (
            <li key={note.id}>
              <NoteCard note={note} />
            </li>
          ))}
      </ul>
      <CreateButton
        onClick={() => {
          store.addNote();
        }}
      />
    </div>
  );
}

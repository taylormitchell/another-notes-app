import { CreateButton } from "../components/CreateButton";
import { NoteCard } from "../components/NoteCard";
import { useState } from "react";
import { useNotes } from "../lib/hooks";
import { useStoreContext } from "../lib/store";
import { MiniSearchBar } from "../components/MiniSearchBar";

export default function Notes() {
  const store = useStoreContext();
  const notes = useNotes(store);
  const [search, setSearch] = useState("");
  return (
    <div>
      <header className="flex justify-end p-4 items-center">
        <MiniSearchBar search={search} setSearch={setSearch} />
      </header>
      <main className="max-w-2xl mx-auto flex flex-col items-center">
        <ul className="w-full space-y-4 p-4">
          {notes
            .filter((note) => (search ? note.content.includes(search) : true))
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
      </main>
    </div>
  );
}

import { CreateButton } from "../components/CreateButton";
import { NoteCard } from "../components/NoteCard";
import { useState } from "react";
import { useNotes } from "../lib/hooks";
import { useStoreContext } from "../lib/store";
import { MiniSearchBar } from "../components/MiniSearchBar";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { useHotkey } from "../lib/utils";

export default function Notes() {
  const store = useStoreContext();
  const notes = useNotes(store);
  const [search, setSearch] = useState("");

  useHotkey("n", () => {
    const el = document.activeElement as HTMLElement;
    if (el.tagName === "INPUT") return false;
    if (el.contentEditable === "true") return false;
    store.addNote();
  });

  return (
    <div>
      <Header>
        <Sidebar />
        <MiniSearchBar search={search} setSearch={setSearch} />
      </Header>
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

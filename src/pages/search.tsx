import { NoteCard } from "@/components/NoteCard";
import { useNotes } from "@/lib/hooks";
import { useStoreContext } from "@/lib/store";
import { useState } from "react";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const store = useStoreContext();
  const notes = useNotes(store);

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      <input
        className="w-full p-4"
        type="text"
        placeholder="Search..."
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm ? (
        <ul className="w-full space-y-4 p-4">
          {notes
            .filter((note) => note.content.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((note) => (
              <li key={note.id}>
                <NoteCard note={note} />
              </li>
            ))}
        </ul>
      ) : (
        <div className="text-center text-gray-400">Search for a note</div>
      )}
    </div>
  );
}

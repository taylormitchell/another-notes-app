import { NoteCard } from "../components/NoteCard";
import { useState } from "react";
import { useLists, useNotes } from "../lib/hooks";
import { useStoreContext } from "../lib/store";
import { ListCard } from "../components/ListCard";
import { List, Note } from "../types";

type Result = { type: "list"; item: List } | { type: "note"; item: Note };
type TypeFilter = "list" | "note" | "all";

function getFilteredItems(
  searchTerm: string,
  type: TypeFilter,
  lists: List[],
  notes: Note[]
): Result[] {
  return [
    ...(type === "list" || type === "all" ? lists : [])
      .filter((list) => list.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((list) => ({ type: "list" as const, item: list })),
    ...(type === "note" || type === "all" ? notes : [])
      .filter((note) => note.content.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((note) => ({ type: "note" as const, item: note })),
  ];
}

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const store = useStoreContext();
  const lists = useLists(store);
  const notes = useNotes(store);

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      <div className="w-full flex space-x-4">
        <input
          className="w-full p-4"
          type="text"
          placeholder={`Search ${typeFilter === "all" ? "notes and lists" : typeFilter + "s"}`}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="w-full w-20" onChange={(e) => setTypeFilter(e.target.value as any)}>
          <option value="all">All</option>
          <option value="list">Lists</option>
          <option value="note">Notes</option>
        </select>
      </div>

      {searchTerm ? (
        <ul className="w-full space-y-4 p-4">
          {getFilteredItems(searchTerm, typeFilter, lists, notes)
            .sort(
              (a, b) =>
                new Date(b.item.created_at).getTime() - new Date(a.item.created_at).getTime()
            )
            .map(({ type, item }) => {
              if (type === "list") {
                return (
                  <li key={item.id}>
                    <ListCard list={item} />
                  </li>
                );
              } else {
                return (
                  <li key={item.id}>
                    <NoteCard note={item} />
                  </li>
                );
              }
            })}
        </ul>
      ) : null}
    </div>
  );
}

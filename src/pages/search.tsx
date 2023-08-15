import { useState } from "react";
import { useQuery } from "react-query";
import { fetchNotes } from "./notes";
import { getLists } from "./lists";
import { createNote } from "./new";
import { useAuth } from "../components/useAuth";
import { v4 as uuid } from "uuid";
import { useRouter } from "next/router";

export default () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const { data: notes, isLoading: notesLoading } = useQuery("notes", fetchNotes);
  const { data: lists, isLoading: listsLoading } = useQuery("lists", getLists);
  const [selected, setSelected] = useState(0);
  const router = useRouter();

  if (notesLoading || listsLoading) return <p>Loading...</p>;

  let idx = 0;
  const results = [
    ...notes
      .filter((note) => note.text.includes(search))
      .map((note) => (
        <div key={note.id} className={idx++ === selected ? "bg-blue-200" : ""}>
          {note.text}
        </div>
      )),
    ...lists
      .filter((list) => list.name.includes(search))
      .map((list) => (
        <div key={list.id} className={idx++ === selected ? "bg-blue-200" : ""}>
          {list.name}
        </div>
      )),
    <div
      key="create"
      className={idx === selected ? "bg-blue-200" : ""}
      onClick={async () => {
        const id = uuid();
        await createNote({
          id,
          text: search,
          author: user.id,
        });
        router.push("/notes/[id]", `/notes/${id}`);
      }}
    >
      Create "{search}" note
    </div>,
  ];

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "ArrowDown") {
          setSelected((selected + 1) % results.length);
        } else if (e.key === "ArrowUp") {
          setSelected((selected - 1 + results.length) % results.length);
        }
      }}
    >
      <input
        type="text"
        name="search"
        defaultValue={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="search..."
        autoComplete="off"
      />
      {results}
    </div>
  );
};

import { useEffect, useState } from "react";
// import { useAllListsQuery, useAllNotesQuery } from "../types/graphql";

export default () => {
  // const [search, setSearch] = useState("");
  // const { data: notes, refetch: refetchNotes } = useAllNotesQuery();
  // const { data: lists, refetch: refetchLists } = useAllListsQuery();
  // const noteResults =
  //   notes?.allNotes.filter((note) =>
  //     note.text.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  //   ) || [];
  // const listResults =
  //   lists?.allLists.filter((list) =>
  //     list.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  //   ) || [];

  // useEffect(() => {
  //   refetchNotes();
  //   refetchLists();
  // }, []);

  return (
    <div>
      <span>Search:</span>
      {/* <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div>
        <h2>Notes:</h2>
        {noteResults?.map((note) => (
          <div key={note.id}>{note.text}</div>
        ))}
        <h2>Lists:</h2>
        {listResults?.map((list) => (
          <div key={list.id}>{list.name}</div>
        ))}
      </div> */}
    </div>
  );
};

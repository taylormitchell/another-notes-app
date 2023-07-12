import React from "react";
import { useAllNotesQuery } from "../types/graphql";
import Link from "next/link";

const Notes: React.FC = () => {
  const { data, loading, error, refetch } = useAllNotesQuery();

  React.useEffect(() => {
    refetch();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div>
      {data?.allNotes.map((note) => (
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

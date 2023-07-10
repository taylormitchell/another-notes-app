import React from "react";
import { useAllListsQuery } from "../types/graphql";
import Link from "next/link";

const Lists: React.FC = () => {
  const { data, loading, error } = useAllListsQuery();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div>
      {data?.allLists.map((list) => (
        <div key={list.id}>
          <Link href={`/lists/${list.id}`}>{list.name}</Link>
        </div>
      ))}
    </div>
  );
};

export default () => {
  return (
    <div>
      <h2>My Lists:</h2>
      <Lists />
    </div>
  );
};

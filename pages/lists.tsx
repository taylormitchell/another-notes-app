import React from "react";
import { useAllListsQuery, useCreateListMutation } from "../types/graphql";
import Link from "next/link";

const Lists: React.FC = () => {
  const { data, loading, error, refetch } = useAllListsQuery();
  const [createList] = useCreateListMutation();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div>
      {data?.allLists.map((list) => (
        <div key={list.id}>
          <Link href={`/lists/${list.id}`}>{list.name}</Link>
        </div>
      ))}
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const name = e.currentTarget.name.value;
            createList({
              variables: { name },
            });
            refetch();
            e.currentTarget.reset();
          }}
        >
          <input type="text" name="name" />
          <button type="submit">submit</button>
        </form>
      </div>
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

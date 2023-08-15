import React from "react";
import Link from "next/link";
import { List } from "@prisma/client";
import axios from "axios";
import { getListsResponse } from "../api/lists";
import { useQuery } from "react-query";

export async function getLists(): Promise<List[]> {
  const { data } = await axios.get<getListsResponse>("/api/lists");
  if (!data) throw new Error("No data");
  if (data.error) throw new Error(data.error);
  return data.value;
}

const Lists: React.FC = () => {
  const { data: lists, error, isLoading } = useQuery("lists", getLists);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div>
      {lists.map((list) => (
        <div key={list.id}>
          <Link href={`/lists/${list.id}`}>{list.name}</Link>
        </div>
      ))}
      {/* <div>
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
      </div> */}
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

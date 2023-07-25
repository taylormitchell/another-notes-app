// pages/list/[id].tsx
import { useRouter } from "next/router";
import Link from "next/link";
import { ListWithChildren } from "../../../types";
import { Note } from "@prisma/client";
import axios from "axios";
import { getListResponse } from "../api/lists/[id]";
import { useQuery } from "react-query";

async function getListById(id: number): Promise<ListWithChildren> {
  const { data } = await axios.get<getListResponse>(`/api/lists/${id}`);
  if (!data) throw new Error("No data");
  if (data.error) throw new Error(data.error);
  return data.value;
}

const List = () => {
  const router = useRouter();
  const id = parseInt(typeof router.query.listId === "string" ? router.query.listId : "-1");

  const { data: list, error, isLoading } = useQuery(["list", id], () => getListById(id));

  if (isLoading) return <p>Loading...</p>;
  if (error) {
    console.error(error);
    return (
      <div>
        <p>Error :(</p>
        <p>{String(error)}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>{list.name}</h2>
      {list.notes.map((note: Note) => (
        <div key={note.id}>
          <Link href={`/notes/${note.id}`}>
            {note.id} - {note.text}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default List;

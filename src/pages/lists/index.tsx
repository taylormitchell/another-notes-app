import axios from "axios";
import { QueryClient, useMutation, useQuery, useQueryClient } from "react-query";
import Link from "next/link";
import { uuid } from "../../lib/utils";

type List = {
  id: string;
  name: string;
};

export default function Lists() {
  const queryClient = useQueryClient();

  const { data: lists, isLoading } = useQuery<List[]>("lists", async () => {
    const { data } = await axios.post("/api/db", [{ query: `SELECT * FROM list` }]);
    return data;
  });

  const deleteList = useMutation(
    async (id: string) => {
      await axios.post("/api/db", [
        {
          query: `DELETE FROM list WHERE id = $1`,
          params: [id],
        },
      ]);
    },
    {
      onMutate: (id) => {
        const lists = queryClient.getQueryData<any[]>("lists");
        const updatedLists = lists.filter((t) => t.id !== id);
        queryClient.setQueryData("lists", updatedLists);
      },
    }
  );

  const createList = useMutation(
    async (list: { id: string; name: string }) => {
      await axios.post("/api/db", [
        {
          query: `INSERT INTO list (id, name) VALUES ($1, $2)`,
          params: [list.id, list.name],
        },
      ]);
      return list;
    },
    {
      onMutate: (list) => {
        const lists = queryClient.getQueryData<any[]>("lists");
        queryClient.setQueryData("lists", [...lists, list]);
      },
    }
  );

  if (isLoading) return null;

  return (
    <div>
      <h1>Lists</h1>
      <ul>
        {lists.map((list) => (
          <li key={list.id}>
            <span className="flex justify-between items-center">
              <Link href={`/lists/${list.id}`}>{list.name}</Link>
              <button
                className="w-8"
                onClick={() => {
                  deleteList.mutate(list.id);
                }}
              >
                x
              </button>
            </span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => {
          const id = uuid();
          const name = new Date().getTime().toString();
          createList.mutate({ id, name });
        }}
      >
        +
      </button>
    </div>
  );
}

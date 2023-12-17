import axios from "axios";
import { QueryClient, useMutation, useQuery, useQueryClient } from "react-query";
import Link from "next/link";
import { uuid } from "../../lib/utils";

type List = {
  id: string;
  name: string;
  children: { id: string; content: string }[];
};

export default function Lists() {
  const queryClient = useQueryClient();

  // Get all lists and the first 3 children of each list
  const { data: lists, isLoading } = useQuery<List[]>("listsWithChildren", async () => {
    const result = await axios.post("/api/db", [
      {
        query: `
          select
            list.id, list.name,
            child_note.id child_note_id, child_note.content child_note_content
          from list
          left join list_entries on list.id = list_entries.parent_list_id
          left join note child_note on list_entries.child_note_id = child_note.id
          `,
      },
    ]);
    const data = result.data;
    const lists: { [key: string]: List } = {};
    data.forEach((row) => {
      if (!lists[row.id]) {
        lists[row.id] = {
          id: row.id,
          name: row.name,
          children: [],
        };
      }
      if (row.child_note_id) {
        lists[row.id].children.push({
          id: row.child_note_id,
          content: row.child_note_content,
        });
      }
    });
    return Object.values(lists);
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
        const lists = queryClient.getQueryData<any[]>("listsWithChildren");
        const updatedLists = lists.filter((t) => t.id !== id);
        queryClient.setQueryData("listsWithChildren", updatedLists);
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
        const lists = queryClient.getQueryData<any[]>("listsWithChildren");
        queryClient.setQueryData("listsWithChildren", [...lists, list]);
      },
    }
  );

  if (isLoading) return null;

  return (
    <div>
      <ul>
        {lists.map((list) => (
          <li key={list.id}>
            <span className="flex justify-between items-center">
              <Link href={`/lists/${list.id}`}>
                {list.name ? (
                  list.name
                ) : (
                  <em>
                    {'"' +
                      list.children
                        .map((c) => c.content)
                        .join(" ")
                        .slice(0, 20) +
                      "..." +
                      '"'}
                  </em>
                )}
                <span> ({list.children.length})</span>
              </Link>
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

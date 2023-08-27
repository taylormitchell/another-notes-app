import axios from "axios";
import { QueryClient, useMutation, useQuery, useQueryClient } from "react-query";
import Link from "next/link";
import { uuid } from "../../lib/utils";

type Tag = {
  id: string;
  name: string;
};

export default function Tags() {
  const queryClient = useQueryClient();

  const { data: tags, isLoading } = useQuery<Tag[]>("tags", async () => {
    const { data } = await axios.post("/api/db", [{ query: `SELECT * FROM tag` }]);
    return data;
  });

  const deleteTag = useMutation(
    async (id: string) => {
      await axios.post("/api/db", [
        {
          query: `DELETE FROM tag WHERE id = $1`,
          params: [id],
        },
      ]);
    },
    {
      onMutate: (id) => {
        const tags = queryClient.getQueryData<any[]>("tags");
        const updatedTags = tags.filter((t) => t.id !== id);
        queryClient.setQueryData("tags", updatedTags);
      },
    }
  );

  const createTag = useMutation(
    async (tag: { id: string; name: string }) => {
      await axios.post("/api/db", [
        {
          query: `INSERT INTO tag (id, name) VALUES ($1, $2)`,
          params: [tag.id, tag.name],
        },
      ]);
      return tag;
    },
    {
      onMutate: (tag) => {
        const tags = queryClient.getQueryData<any[]>("tags");
        queryClient.setQueryData("tags", [...tags, tag]);
      },
    }
  );

  if (isLoading) return null;

  return (
    <div>
      <h1>Tags</h1>
      <ul>
        {tags.map((tag) => (
          <li key={tag.id}>
            <span className="flex justify-between items-center">
              <Link href={`/tags/${tag.id}`}>{tag.name}</Link>
              <button
                className="w-8"
                onClick={() => {
                  deleteTag.mutate(tag.id);
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
          createTag.mutate({ id, name });
        }}
      >
        +
      </button>
    </div>
  );
}

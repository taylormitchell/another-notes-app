import { QueryClient, useMutation, useQuery, useQueryClient } from "react-query";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { uuid } from "../../lib/utils";

export default function Tags() {
  const queryClient = useQueryClient();
  // react query for tags using supabase
  const { data: tags, isLoading } = useQuery("tags", async () => {
    const { data, error } = await supabase.from("tags").select("*");
    if (error) throw error;
    return data;
  });

  const deleteTag = useMutation(
    async (id: string) => {
      await supabase.from("tags").delete().match({ id });
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
      await supabase.from("tags").insert(tag);
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

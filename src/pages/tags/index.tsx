import { QueryClient, useQuery } from "react-query";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

export default function Tags() {
  const queryClient = new QueryClient();
  // react query for tags using supabase
  const { data: tags, isLoading } = useQuery("tags", async () => {
    const { data, error } = await supabase.from("tags").select("*");
    if (error) throw error;
    return data;
  });

  const deleteTag = async (id: string) => {
    console.log("delete tag", id);
    await supabase.from("tags").delete().match({ id });
    queryClient.invalidateQueries("tags");
  };

  if (isLoading) return null;
  return (
    <div>
      <h1>Tags</h1>
      <ul>
        {tags.map((tag) => (
          <li key={tag.id}>
            <span>
              <Link href={`/tags/${tag.id}`}>{tag.name}</Link>
              <button
                onClick={() => {
                  deleteTag(tag.id);
                }}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import Link from "next/link";
import { useQueryClient, useMutation } from "react-query";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/router";
import { uuid } from "../lib/utils";

const BottomNav = () => {
  const queryClient = useQueryClient();

  const router = useRouter();
  // create a new note
  const createTag = useMutation(
    async (tag: { id: string; name: string }) => {
      await supabase.from("tags").insert(tag);
      return tag;
    },
    {
      onMutate: (tag) => {
        const tags = (queryClient.getQueryData("tags") as any[]) ?? [];
        queryClient.setQueryData("tags", [...tags, tag]);
      },
    }
  );

  return (
    <>
      {/* equally spaced, buttons, grey */}
      <div className="w-full h-16 bg-gray-100 fixed bottom-0 left-0">
        <div className="flex justify-between items-center h-full px-4">
          <Link href="/tags">Tags</Link>
          <button
            onClick={() => {
              const id = uuid();
              createTag.mutate({ id, name: new Date().getTime().toString() });
              router.push(`/tags/${id}`);
            }}
          >
            Create new tag
          </button>
        </div>
      </div>
    </>
  );
};

export default BottomNav;

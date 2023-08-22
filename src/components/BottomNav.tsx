import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./useAuth";
import { createNote } from "../pages/new";
import { useQueryClient, useMutation } from "react-query";
import { Note } from "@prisma/client";
import { v4 as uuid } from "uuid";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/router";

const BottomNav = () => {
  const [text, setText] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const notesQuery = queryClient.getQueryData<Note[]>("notes");
  const [showNav, setShowNav] = useState(true);

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
      <div
        style={{
          position: "fixed",
          bottom: 0,
        }}
      >
        <button
          onClick={() => {
            const id = uuid();
            createTag.mutate({ id, name: new Date().getTime().toString() });
            router.push(`/tags/${id}`);
          }}
        >
          Create new tag
        </button>

        {/* <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="flex items-center">
            <input
              className="flex-grow px-4 py-2 text-gray-700 bg-gray-200 border-2 border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500"
              type="text"
              name="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => {
                window.scrollTo(0, 0);
                document.body.scrollTop = 0;
                setShowNav(false);
              }}
              onBlur={() => setShowNav(true)}
            />
            <button
              className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none"
              type="submit"
            >
              Submit
            </button>
          </div>
        </form>
        {showNav && (
          <div className="px-2 py-3 mx-auto max-w-screen-xl">
            <div className="flex justify-between">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
       */}
      </div>
    </>
  );
};

export default BottomNav;

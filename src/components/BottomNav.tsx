import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./useAuth";
import { createNote } from "../pages/new";
import { useQueryClient, useMutation } from "react-query";
import { Note } from "@prisma/client";
import { v4 as uuid } from "uuid";

const navItems = [
  { name: "Lists", path: "/lists" },
  { name: "Notes", path: "/notes" },
  { name: "Create", path: "/new" },
  { name: "Search", path: "/search" },
];

const BottomNav = () => {
  const [text, setText] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const notesQuery = queryClient.getQueryData<Note[]>("notes");

  const mutation = useMutation(createNote, {
    // Optimistic update
    onMutate: (newNote) => {
      // Update the cache with the optimistic response
      queryClient.setQueryData("notes", [...notesQuery, newNote]);
    },
    // Callback to refetch notes after a successful mutation
    onSuccess: () => {
      queryClient.invalidateQueries("notes");
    },
  });

  const handleSubmit = () => {
    mutation.mutate({
      id: uuid(),
      text,
      author: user.id,
    });
    setText("");
  };

  return (
    <>
      <div className="bg-white shadow-lg">
        {/* full width text input with "submit" button on right side. uses a form */}
        <form
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
            />
            <button
              className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none"
              type="submit"
            >
              Submit
            </button>
          </div>
        </form>
        <div className="px-2 py-3 mx-auto max-w-screen-xl">
          <div className="flex justify-between">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomNav;

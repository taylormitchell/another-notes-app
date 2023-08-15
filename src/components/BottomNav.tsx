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
        <div className="flex justify-between px-2 py-3 mx-auto max-w-screen-xl">
          <div className="flex-grow">
            <input
              type="text"
              value={text}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Search..."
              onChange={(e) => setText(e.target.value)}
              onSubmit={handleSubmit}
            />
          </div>
          <div className="flex items-center ml-2">
            <button
              className="px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-md"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
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

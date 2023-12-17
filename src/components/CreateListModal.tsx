import React, { useEffect, useRef, useState } from "react";
import { useCreateNote } from "@/lib/noteMutations";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { uuid } from "@/lib/utils";
import { useRouter } from "next/router";

type List = {
  id: string;
  name: string;
  created_at: string;
};

function useCreateList() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(
    async (list: List) => {
      console.log("mutate", list);
      await axios.post("/api/db", [
        {
          query: `INSERT INTO list (id, name, created_at) VALUES ($1, $2, $3)`,
          params: [list.id, list.name, list.created_at],
        },
      ]);
    },
    {
      onMutate: (list) => {
        const lists = queryClient.getQueryData<List[]>("lists");
        queryClient.setQueryData("lists", [...lists, list]);
      },
    }
  );
  return (name: string) => {
    const list = { id: uuid(), name, created_at: new Date().toISOString() };
    mutate(list);
    return list;
  };
}

/**
 * Modal for creating a new list. When typing in a new list, the user is shown
 * a list of existing lists that match the input. If the user selects one of
 * these lists, then the user opens that list instead of creating a new one.
 */
export const CreateListModal = ({ onClose }: { onClose: () => void }) => {
  const [content, setContent] = useState("");
  const router = useRouter();
  const createList = useCreateList();
  const modalRef = useRef<HTMLDivElement>();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get all lists and, if they have any entries, the last positioned note in the list_entries table
  const { data: lists } = useQuery<List[]>("lists", async () => {
    const result = await axios.post("/api/db", [
      {
        query: `select id, name, created_at from list`,
      },
    ]);
    console.log(result.data);
    return result.data;
  });

  // Input element with list of matching lists below it.
  // Tapping an option in the list opens that list.
  // Tapping create creates a new list.

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-64 bg-white rounded-lg p-3" ref={modalRef}>
        <input
          className="p-4 border h-4"
          onChange={(e) => setContent(e.currentTarget.value)}
          value={content}
        />
        <ul className="overflow-y-scroll overflow-x-hidden max-h-64">
          {content &&
            lists
              ?.filter((list) => list.name !== "" && list.name.includes(content))
              .map((list) => (
                <li
                  key={list.id}
                  onClick={() => {
                    onClose();
                    router.push(`/lists/${list.id}`);
                  }}
                >
                  {list.name}
                </li>
              ))}
        </ul>
        <div className="flex justify-end space-x-4">
          <button className="text-gray-500" onClick={onClose}>
            Cancel
          </button>
          <button
            className="text-gray-500"
            onClick={async () => {
              const list = createList(content);
              // TODO: should await before redirecting?
              router.push(`/lists/${list.id}`);
              onClose();
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect, useRef } from "react";
import { filterByText } from "../lib/utils";
import { useLists } from "../lib/hooks";
import { useStoreContext } from "../lib/store";

const ListSelection = ({
  selectedIds,
  toggleSelection,
  close,
}: {
  selectedIds: string[];
  toggleSelection: (id: string) => void;
  close: () => void;
}) => {
  const store = useStoreContext();
  const lists = useLists(store);
  const [filter, setFilter] = useState("");

  // If the user clicks outside of the dropdown, close it
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [close]);

  return (
    <div ref={ref} className="w-64 bg-white rounded border border-gray-200 shadow-md">
      <input
        type="text"
        placeholder="Add label..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full p-2"
      />
      <ul className="max-h-60 overflow-auto">
        {filterByText(lists, filter)
          .filter((list) => list.name !== "")
          .map((list) => (
            <li
              key={list.id}
              className={`flex items-center p-2 cursor-pointer hover:bg-gray-100 ${
                selectedIds.includes(list.id) ? "bg-blue-200" : ""
              }`}
              onClick={() => toggleSelection(list.id)}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(list.id)}
                onChange={() => toggleSelection(list.id)}
                className="mr-2"
              />
              {list.name}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default ListSelection;

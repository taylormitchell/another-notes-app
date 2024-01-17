import React, { useCallback, useState } from "react";
import { sortByUpdatedAt, useHotkey } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { useModalsContext } from "../lib/modalContext";
import { useLists, useNotes } from "../lib/hooks";
import { useStoreContext } from "../lib/store";
import { List, Link } from "react-feather";

interface Option {
  name: string;
  jsx: JSX.Element;
  handler: () => void;
}

export const CommandBar: React.FC = () => {
  const store = useStoreContext();
  const navigate = useNavigate();
  const modal = useModalsContext().commandbar;
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const notes = useNotes(store);
  const lists = useLists(store);

  const searchLower = search.toLocaleLowerCase();
  const commandOptions = [
    {
      name: "Notes",
      handler: () => navigate("/notes"),
    },
    {
      name: "Lists",
      handler: () => navigate("/lists"),
    },
    {
      name: "Home",
      handler: () => navigate("/"),
    },
  ]
    .filter((command) => command.name.toLocaleLowerCase().includes(searchLower))
    .map((command) => ({
      ...command,
      jsx: (
        <div className="flex items-center gap-2">
          <Link />
          {command.name}
        </div>
      ),
    }));

  const listOptions = lists
    .filter((list) => list.name.toLocaleLowerCase().includes(searchLower))
    .sort(sortByUpdatedAt)
    .map((list) => ({
      name: list.name,
      jsx: (
        <div className="flex items-center gap-2">
          <List />
          {list.name}
        </div>
      ),
      handler: () => navigate(`/lists/${list.id}`),
    }));
  const noteOptions = notes
    .filter((note) => note.content.toLocaleLowerCase().includes(searchLower))
    .sort(sortByUpdatedAt)
    .map((note) => ({
      name: note.content,
      jsx: <div>{note.content}</div>,
      handler: () => navigate(`/notes/${note.id}`),
    }));
  const filteredOptions: Option[] = [...commandOptions, ...listOptions, ...noteOptions];

  const close = useCallback(() => {
    modal.close();
    setSelectedIndex(0);
    setSearch("");
  }, [modal, setSelectedIndex, setSearch]);

  const selectCommand = (i: number) => {
    filteredOptions[i].handler();
    close();
  };

  useHotkey("Escape", close);
  useHotkey("ArrowDown", () => setSelectedIndex((prev) => (prev + 1) % filteredOptions.length));
  useHotkey("ArrowUp", () => setSelectedIndex((prev) => (prev - 1) % filteredOptions.length));
  useHotkey("Enter", () => selectCommand(selectedIndex));

  return (
    <>
      <div className="fixed inset-0 z-10" aria-hidden="true" onClick={close}>
        <div
          className="fixed top-1/4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg p-4 rounded-lg w-11/12 lg:w-1/3"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            autoFocus
            type="text"
            value={search}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            placeholder="Type your command..."
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          {/* scrollable list of options */}
          <div className="max-h-96 overflow-y-auto">
            <ul className="mt-2">
              {search &&
                filteredOptions.map((option, index) => (
                  <li
                    key={index}
                    className={`p-2 ${index === selectedIndex ? "bg-gray-200" : ""}`}
                    onClick={() => {
                      selectCommand(index);
                    }}
                  >
                    {option.jsx}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

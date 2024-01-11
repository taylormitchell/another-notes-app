import React, { useState } from "react";
import { useHotkey } from "../lib/utils";

interface Command {
  name: string;
  handler: () => void;
}

export const CommandBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commands: Command[] = [
    {
      name: "Notes",
      handler: () => {
        // TODO should be doing this with react router
        window.location.href = "/notes";
      },
    },
    {
      name: "Lists",
      handler: () => {
        // TODO should be doing this with react router
        window.location.href = "/lists";
      },
    },
  ];

  useHotkey(
    (e) => e.metaKey && e.key === "k",
    () => {
      isOpen ? setIsOpen(false) : setIsOpen(true);
    }
  );
  useHotkey("Escape", () => {
    setSearch("");
    if (search === "") {
      setIsOpen(false);
    }
  });
  useHotkey("ArrowDown", () => setSelectedIndex((prev) => (prev + 1) % commands.length));
  useHotkey("ArrowUp", () => setSelectedIndex((prev) => (prev - 1) % commands.length));
  useHotkey("Enter", () => {
    commands[selectedIndex].handler();
    setIsOpen(false);
  });

  if (!isOpen) return null;
  return (
    <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg p-4 rounded-lg">
      <input
        autoFocus
        type="text"
        value={search}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        placeholder="Type your command..."
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul className="mt-2">
        {commands
          .filter((command) =>
            search ? command.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) : true
          )
          .map((command, index) => (
            <li
              key={command.name}
              className={`p-2 ${index === selectedIndex ? "bg-gray-200" : ""}`}
            >
              {command.name}
            </li>
          ))}
      </ul>
    </div>
  );
};

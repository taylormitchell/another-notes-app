import React, { useMemo, useState } from "react";
import { useHotkey } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { useModalsContext } from "../lib/modalContext";

interface Command {
  name: string;
  handler: () => void;
}

export const CommandBar: React.FC = () => {
  const navigate = useNavigate();
  const { isOpen, open, close } = useModalsContext().commandbar;
  console.log(isOpen);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const allCommands: Command[] = useMemo(
    () => [
      {
        name: "Notes",
        handler: () => navigate("/notes"),
      },
      {
        name: "Lists",
        handler: () => navigate("/lists"),
      },
    ],
    [navigate]
  );
  //   const [recentCommands, setRecentCommands] = useState<Command[]>([]);
  const filteredCommands = useMemo(
    () => allCommands.filter((command) => command.name.toLocaleLowerCase().includes(search)),
    [allCommands, search]
  );

  //   const currentCommands = search ? filteredCommands : recentCommands;
  const currentCommands = search ? filteredCommands : [];
  const selectCommand = () => {
    currentCommands[selectedIndex].handler();
    setSearch("");
    close();
    // setRecentCommands((prev) => {
    //   const newRecentCommands = prev.filter(
    //     (command) => command.name !== currentCommands[selectedIndex].name
    //   );
    //   newRecentCommands.unshift(currentCommands[selectedIndex]);
    //   return newRecentCommands;
    // });
  };

  useHotkey(
    (e) => e.metaKey && e.key === "k",
    () => {
      console.log("open");
      open();
    }
  );
  useHotkey("Escape", () => {
    setSearch("");
    if (search === "") {
      close();
    }
  });
  useHotkey("ArrowDown", () => setSelectedIndex((prev) => (prev + 1) % currentCommands.length));
  useHotkey("ArrowUp", () => setSelectedIndex((prev) => (prev - 1) % currentCommands.length));
  useHotkey("Enter", () => selectCommand());

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
        onBlur={() => {
          setSearch("");
          close();
        }}
      />
      <ul className="mt-2">
        {currentCommands.map((command, index) => (
          <li
            key={command.name}
            className={`p-2 ${index === selectedIndex ? "bg-gray-200" : ""}`}
            onClick={() => {
              selectCommand();
            }}
          >
            {command.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

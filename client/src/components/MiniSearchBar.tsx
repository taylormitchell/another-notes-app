import { Search } from "react-feather";
import { useState } from "react";
import { useHotkey } from "../lib/utils";

export function MiniSearchBar({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (search: string) => void;
}) {
  const [showInput, setShowInput] = useState(false);
  useHotkey("Escape", () => {
    setSearch("");
    setShowInput(false);
  });
  useHotkey(
    (e) => {
      return e.metaKey && e.key === "f";
    },
    () => {
      setShowInput(true);
    }
  );

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          setShowInput(true);
        }}
      >
        <Search />
      </button>
      {showInput && (
        <input
          className="border border-gray-300 rounded px-4 pl-8"
          autoFocus
          onBlur={(e) => {
            if (e.target.value === "") {
              setShowInput(false);
            }
          }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
      )}
    </div>
  );
}

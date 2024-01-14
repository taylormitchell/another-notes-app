import { Search } from "react-feather";
import { useRef } from "react";
import { useHotkey } from "../lib/utils";
import { useSearchContext } from "../lib/SearchContext";

export function MiniSearchBar({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (search: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const { isOpen, setIsOpen, clear } = useSearchContext();

  // Open search bar
  useHotkey(
    (e) => e.metaKey && e.key === "f",
    () => setIsOpen(true)
  );

  useHotkey("Escape", clear);

  return (
    <div ref={ref} className="flex items-center gap-2">
      <button
        onClick={() => {
          setIsOpen((v) => !v);
        }}
      >
        <Search />
      </button>
      {isOpen && (
        <input
          className="border border-gray-300 rounded px-4 pl-8"
          autoFocus
          onBlur={(e) => {
            if (e.target.value === "") {
              setIsOpen(false);
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

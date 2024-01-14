import { useState, createContext, useContext, useCallback } from "react";

const SearchContext = createContext<{
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  clear: () => void;
}>({
  search: "",
  setSearch: () => {},
  isOpen: false,
  setIsOpen: () => {},
  clear: () => {},
});

export const useSearchContext = () => useContext(SearchContext);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const clear = useCallback(() => {
    setSearch("");
    setIsOpen(false);
  }, []);

  return (
    <SearchContext.Provider value={{ search, setSearch, isOpen, setIsOpen, clear }}>
      {children}
    </SearchContext.Provider>
  );
};

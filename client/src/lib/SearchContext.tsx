import { useState, createContext, useContext } from "react";

const SearchContext = createContext<{ search: string; setSearch: (s: string) => void }>({
  search: "",
  setSearch: () => {},
});

export const useSearchContext = () => useContext(SearchContext);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [search, setSearch] = useState("");

  return <SearchContext.Provider value={{ search, setSearch }}>{children}</SearchContext.Provider>;
};

import { useState, createContext, useContext } from "react";
import { Sidebar } from "react-feather";
import { MiniSearchBar } from "../components/MiniSearchBar";

export function Header({ search, setSearch }: { search: string; setSearch: (s: string) => void }) {
  return (
    <header className="flex justify-between p-4 items-center">
      <Sidebar />
      <MiniSearchBar search={search} setSearch={setSearch} />
    </header>
  );
}

const HeaderContext = createContext(null);

export const useHeaderContext = () => useContext(HeaderContext);

export const HeaderProvider = ({ children }) => {
  const [headerContent, setHeaderContent] = useState(null);

  return (
    <HeaderContext.Provider value={{ headerContent, setHeaderContent }}>
      {children}
    </HeaderContext.Provider>
  );
};

import { createContext, useContext, useState } from "react";

const DisplayContext = createContext<{
  view: "card" | "document";
  setView: (s: "card" | "document") => void;
  sort: "position" | "upvotes";
  setSort: (s: "position" | "upvotes") => void;
}>({
  view: "card",
  setView: () => {},
  sort: "position",
  setSort: () => {},
});

export const useDisplayContext = () => useContext(DisplayContext);

export const DisplayProvider = ({ children }: { children: React.ReactNode }) => {
  const [view, setView] = useState<"card" | "document">("card");
  const [sort, setSort] = useState<"position" | "upvotes">("position");

  return (
    <DisplayContext.Provider value={{ view, setView, sort, setSort }}>
      {children}
    </DisplayContext.Provider>
  );
};

import { createContext, useContext, useState } from "react";

const DisplayContext = createContext<{
  view: "card" | "document";
  setView: (s: "card" | "document") => void;
}>({
  view: "card",
  setView: () => {},
});

export const useDisplayContext = () => useContext(DisplayContext);

export const DisplayProvider = ({ children }: { children: React.ReactNode }) => {
  const [view, setView] = useState<"card" | "document">("card");

  return <DisplayContext.Provider value={{ view, setView }}>{children}</DisplayContext.Provider>;
};

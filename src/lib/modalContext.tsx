import { ReactNode, createContext, useContext, useState } from "react";

type Modal = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

type Modals = {
  createNote: Modal;
  createList: Modal;
};

export const ModalsContext = createContext<Modals>({
  createNote: { isOpen: false, open: () => {}, close: () => {} },
  createList: { isOpen: false, open: () => {}, close: () => {} },
});

export const useModalsContext = () => {
  return useContext(ModalsContext);
};

export const ModalsProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState({ createNote: false, createList: false });
  const value = {
    createNote: {
      isOpen: isOpen.createNote,
      open: () => setIsOpen((v) => ({ ...v, createNote: true })),
      close: () => setIsOpen((v) => ({ ...v, createNote: false })),
    },
    createList: {
      isOpen: isOpen.createList,
      open: () => setIsOpen((v) => ({ ...v, createList: true })),
      close: () => setIsOpen((v) => ({ ...v, createList: false })),
    },
  };
  return <ModalsContext.Provider value={value}>{children}</ModalsContext.Provider>;
};

import { ReactNode, createContext, useContext, useState } from "react";

type Modal = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

type Modals = {
  createNote: Modal;
  createList: Modal;
  sidebar: Modal;
};

export const ModalsContext = createContext<Modals>({
  createNote: { isOpen: false, open: () => {}, close: () => {}, toggle: () => {} },
  createList: { isOpen: false, open: () => {}, close: () => {}, toggle: () => {} },
  sidebar: { isOpen: false, open: () => {}, close: () => {}, toggle: () => {} },
});

export const useModalsContext = () => {
  return useContext(ModalsContext);
};

export const ModalsProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState({ createNote: false, createList: false, sidebar: false });
  const value = {
    createNote: {
      isOpen: isOpen.createNote,
      open: () => setIsOpen((v) => ({ ...v, createNote: true })),
      close: () => setIsOpen((v) => ({ ...v, createNote: false })),
      toggle: () => setIsOpen((v) => ({ ...v, createNote: !v.createNote })),
    },
    createList: {
      isOpen: isOpen.createList,
      open: () => setIsOpen((v) => ({ ...v, createList: true })),
      close: () => setIsOpen((v) => ({ ...v, createList: false })),
      toggle: () => setIsOpen((v) => ({ ...v, createList: !v.createList })),
    },
    sidebar: {
      isOpen: isOpen.sidebar,
      open: () => setIsOpen((v) => ({ ...v, sidebar: true })),
      close: () => setIsOpen((v) => ({ ...v, sidebar: false })),
      toggle: () => {
        console.log("toggle");
        setIsOpen((v) => ({ ...v, sidebar: !v.sidebar }));
      },
    },
  };
  return <ModalsContext.Provider value={value}>{children}</ModalsContext.Provider>;
};

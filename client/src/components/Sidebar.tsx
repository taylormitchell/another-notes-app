import { useRef } from "react";
import { useModalsContext } from "../lib/modalContext";
import { useNavigate } from "react-router-dom";
import { Sidebar as SidebarIcon } from "react-feather";
import useEventListener from "../lib/useEventListener";
import { inputFocused, noModifiers, useHotkey } from "../lib/utils";
import { useStoreContext } from "../lib/store";

export const Sidebar = () => {
  const store = useStoreContext();
  const { isOpen, toggle, close } = useModalsContext().sidebar;
  const modals = useModalsContext();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEventListener(document, "mousedown", (event) => {
    if (!event.target) return;
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as HTMLElement)) {
      close();
    }
  });

  useHotkey(
    (e) => e.key === "[" && noModifiers(e),
    () => {
      if (inputFocused()) return;
      toggle();
    }
  );

  return (
    <>
      <button
        className="p-2 "
        onClick={() => {
          console.log("clicked");
          toggle();
        }}
      >
        <SidebarIcon />
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10" aria-hidden="true"></div>
      )}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-20 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col w-64 items-left">
          {[
            { name: "Home", handler: () => navigate("/") },
            { name: "Notes", handler: () => navigate("/notes") },
            { name: "Lists", handler: () => navigate("/lists") },
            { name: "Search", handler: () => navigate("/search") },
            { name: "Command Bar", handler: () => modals.commandbar.open() },
            { name: "Create Modal", handler: () => modals.createNote.open() },
            {
              name: "Create Note",
              handler: () => {
                const note = store.addNote();
                navigate(`/notes/${note.id}`);
              },
            },
          ].map(({ name, handler }) => (
            <button
              key={name}
              className="text-left hover:bg-gray-100 h-8 text-xl"
              onClick={() => {
                handler();
                close();
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

import { useState, useRef, useEffect, useCallback } from "react";
import { useLists } from "../lib/hooks";
import { useStoreContext } from "../lib/store";
import { useModalsContext } from "../lib/modalContext";
import useEventListener from "../lib/useEventListener";
import { useHotkey } from "../lib/utils";

export const CreateNoteModal = () => {
  const { close } = useModalsContext().createNote;
  const [content, setContent] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const store = useStoreContext();
  const lists = useLists(store);
  const [listSelectionOpen, setListSelectionOpen] = useState(false);
  const listSelectionRef = useRef<HTMLSelectElement>(null);

  const closeModal = useCallback(() => {
    close();
    setListSelectionOpen(false);
  }, [close, setListSelectionOpen]);

  const create = useCallback(() => {
    const listIds = listSelectionRef.current
      ? Array.from(listSelectionRef.current.selectedOptions).map((option) => option.value)
      : [];
    store.addNote({ content, listPositions: listIds.map((id) => ({ id })) });
    closeModal();
  }, [content, store, closeModal]);

  useEventListener(document, "mousedown", (event) => {
    if (!event.target) return;
    if (modalRef.current && !modalRef.current.contains(event.target as HTMLElement)) {
      closeModal();
    }
  });

  useHotkey("Escape", () => {
    closeModal();
  });

  useHotkey(
    (e) => e.metaKey && e.key === "Enter",
    () => {
      create();
    }
  );

  // Auto focus note content on open
  const noteRef = useRef<HTMLDivElement>(null);
  useEffect(() => noteRef.current?.focus(), []);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-20 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-3 w-11/12 lg:w-1/3" ref={modalRef}>
        <div
          ref={noteRef}
          className="p-4 w-full border h-32"
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => {
            setContent(e.currentTarget.textContent ?? "");
          }}
        />
        {/* multi-select dropdown of existing lists */}
        {listSelectionOpen ? (
          <select className="border w-full" multiple ref={listSelectionRef}>
            {lists
              ?.filter((list) => !!list.name)
              .map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
          </select>
        ) : (
          <button onClick={() => setListSelectionOpen(true)}>Add to list</button>
        )}
        <div className="flex justify-end space-x-4">
          <button className="text-gray-500" onClick={closeModal}>
            Cancel
          </button>
          <button className="text-gray-500" onClick={create}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

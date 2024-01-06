import { useState, useRef } from "react";
import { useLists } from "../lib/hooks";
import { useStoreContext } from "../lib/store";
import { useModalsContext } from "../lib/modalContext";
import useEventListener from "../lib/useEventListener";

export const CreateNoteModal = () => {
  const { isOpen, close } = useModalsContext().createNote;
  const [content, setContent] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const store = useStoreContext();
  const lists = useLists(store);
  const [listSelectionOpen, setListSelectionOpen] = useState(false);
  const listSelectionRef = useRef<HTMLSelectElement>(null);

  const closeModal = () => {
    close();
    setListSelectionOpen(false);
  };

  useEventListener(document, "mousedown", (event) => {
    if (!event.target) return;
    if (modalRef.current && !modalRef.current.contains(event.target as HTMLElement)) {
      closeModal();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-64 bg-white rounded-lg p-3" ref={modalRef}>
        <p
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
          <button
            className="text-gray-500"
            onClick={() => {
              const listIds = listSelectionRef.current
                ? Array.from(listSelectionRef.current.selectedOptions).map((option) => option.value)
                : [];
              store.addNote({ content, listPositions: listIds.map((id) => ({ id })) });
              closeModal();
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

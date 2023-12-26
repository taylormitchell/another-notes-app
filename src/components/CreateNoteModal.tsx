import React, { useEffect, useRef, useState } from "react";
import { useStoreContext } from "@/lib/store";
import { useLists } from "@/lib/hooks";

export const CreateNoteModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [content, setContent] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const store = useStoreContext();
  const lists = useLists(store);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [listSelectionOpen, setListSelectionOpen] = useState(false);
  const listSelectionRef = useRef<HTMLSelectElement>(null);

  const close = () => {
    onClose();
    setListSelectionOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          <button className="text-gray-500" onClick={close}>
            Cancel
          </button>
          <button
            className="text-gray-500"
            onClick={() => {
              const listIds = listSelectionRef.current
                ? Array.from(listSelectionRef.current.selectedOptions).map((option) => option.value)
                : [];
              store.addNote({ content, listPositions: listIds.map((id) => ({ id })) });
              close();
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

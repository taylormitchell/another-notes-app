import React, { useEffect, useRef, useState } from "react";
import { useCreateNote } from "@/lib/noteMutations";
import { uuid } from "@/lib/utils";

export const CreateModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [content, setContent] = useState("");
  const modalRef = useRef<HTMLDivElement>();
  const createNote = useCreateNote();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
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
      <div className="bg-white rounded-lg shadow-xl p-6" ref={modalRef}>
        <h1 className="text-xl font-bold">Create Modal</h1>
        <p>Modal content</p>
        <div
          className="p-4"
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => {
            setContent(e.currentTarget.textContent);
          }}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            createNote({
              id: uuid(),
              content,
            });
            onClose();
          }}
        >
          Create
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

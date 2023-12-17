import React, { useEffect, useRef, useState } from "react";
import { useCreateNote } from "@/lib/noteMutations";

export const CreateNoteModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
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
      <div className="bg-white rounded-lg p-3" ref={modalRef}>
        <p
          className="p-4 border w-64 h-32"
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => {
            setContent(e.currentTarget.textContent);
          }}
        />
        <div className="flex justify-end space-x-4">
          <button className="text-gray-500" onClick={onClose}>
            Cancel
          </button>
          <button
            className="text-gray-500"
            onClick={() => {
              createNote({ content });
              onClose();
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

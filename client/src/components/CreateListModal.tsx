import { useState, useRef } from "react";
import { useLists } from "../lib/hooks";
import { useModalsContext } from "../lib/modalContext";
import { useStoreContext } from "../lib/store";
import { useNavigate } from "react-router-dom";
import useEventListener from "../lib/useEventListener";

/**
 * Modal for creating a new list. When typing in a new list, the user is shown
 * a list of existing lists that match the input. If the user selects one of
 * these lists, then the user opens that list instead of creating a new one.
 */
export const CreateListModal = () => {
  const { isOpen, close: onClose } = useModalsContext().createList;
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const store = useStoreContext();
  const lists = useLists(store);
  const modalRef = useRef<HTMLDivElement>(null);

  useEventListener(document, "mousedown", (event) => {
    if (!event.target) return;
    if (modalRef.current && !modalRef.current.contains(event.target as HTMLElement)) {
      onClose();
    }
  });

  // Get all lists and, if they have any entries, the last positioned note in the list_entries table

  // Input element with list of matching lists below it.
  // Tapping an option in the list opens that list.
  // Tapping create creates a new list.

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div ref={modalRef} className="w-64 bg-white rounded-lg p-3">
        <input
          className="p-4 border h-4"
          onChange={(e) => setContent(e.currentTarget.value)}
          value={content}
        />
        <ul className="overflow-y-scroll overflow-x-hidden max-h-64">
          {content &&
            lists
              ?.filter(
                (list) =>
                  list.name !== "" &&
                  list.name.toLocaleLowerCase().includes(content.toLocaleLowerCase())
              )
              .map((list) => (
                <li
                  key={list.id}
                  onClick={() => {
                    onClose();
                    navigate(`/lists/${list.id}`);
                  }}
                >
                  {list.name}
                </li>
              ))}
        </ul>
        <div className="flex justify-end space-x-4">
          <button className="text-gray-500" onClick={onClose}>
            Cancel
          </button>
          <button
            className="text-gray-500"
            onClick={async () => {
              const list = store.addList({ name: content });
              // TODO: should await before redirecting?
              navigate(`/lists/${list.id}`);
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

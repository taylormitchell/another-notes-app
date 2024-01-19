import { useStoreContext } from "../lib/store";
import MultiSelection from "./MultiSelection";
import { useItemParentIds } from "../lib/hooks";
import { useState } from "react";

export function CardListSelection({ itemId }: { itemId: string }) {
  const [showLists, setShowLists] = useState(false);
  return (
    <>
      {showLists ? (
        <div className="relative">
          <div className="absolute top-0 left-0 z-13">
            <ParentListSelection itemId={itemId} close={() => setShowLists(false)} />
          </div>
        </div>
      ) : (
        <button onClick={() => setShowLists(true)}>Lists</button>
      )}
    </>
  );
}

export function ParentListSelection({ itemId, close }: { itemId: string; close: () => void }) {
  const store = useStoreContext();
  const listIdsWithNote = useItemParentIds(store, itemId);
  return (
    <MultiSelection
      selectedIds={listIdsWithNote}
      toggleSelection={(id: string) => {
        if (listIdsWithNote.includes(id)) {
          store.removeItemFromList({ itemId, listId: id });
        } else {
          store.addItemToList({ itemId, listId: id });
        }
      }}
      close={close}
    />
  );
}

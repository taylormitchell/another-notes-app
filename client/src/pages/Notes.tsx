import { useRef } from "react";
import { CreateButton } from "../components/CreateButton";
import { ItemsColumn } from "../components/ItemsColumn";
import { useSearchContext } from "../lib/SearchContext";
import { env } from "../lib/env";
import { useNotes } from "../lib/hooks";
import { useStoreContext } from "../lib/store";
import { filterByText, inputFocused, sortByCreatedAt, useHotkey } from "../lib/utils";

export default function Notes() {
  const store = useStoreContext();
  const { search } = useSearchContext();
  const notes = filterByText(useNotes(store), search).sort(sortByCreatedAt);
  const focusRef = useRef<string | null>(null);

  useHotkey("n", () => {
    if (inputFocused()) return false;
    const note = store.addNote();
    console.log("set autofocus");
    focusRef.current = note.id;
  });

  return (
    <div className="flex flex-col w-full">
      <h1 className="text-2xl font-bold text-center border-b-2 border-gray-200 pb-2" />
      <ItemsColumn children={notes} />
      {env.isTouchDevice && (
        <CreateButton
          onClick={() => {
            store.addNote();
          }}
        />
      )}
    </div>
  );
}

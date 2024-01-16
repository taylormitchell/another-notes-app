import { useRef } from "react";
import { CreateButton } from "../components/CreateButton";
import { ItemsColumn } from "../components/ItemsColumn";
import { NoteCard } from "../components/NoteCard";
import { useSearchContext } from "../lib/SearchContext";
import { env } from "../lib/env";
import { useNotes } from "../lib/hooks";
import { useStoreContext } from "../lib/store";
import { filterByText, inputFocused, useHotkey } from "../lib/utils";

export default function Notes() {
  const store = useStoreContext();
  const { search } = useSearchContext();
  const notes = useNotes(store);
  const focusRef = useRef<string | null>(null);

  useHotkey("n", () => {
    if (inputFocused()) return false;
    const note = store.addNote();
    console.log("set autofocus");
    focusRef.current = note.id;
  });

  return (
    <div>
      <ItemsColumn>
        {filterByText(notes, search)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((note) => {
            const autofocus = focusRef.current === note.id;
            if (autofocus) {
              console.log("autofocus", note.id);
              focusRef.current = null;
            }
            return (
              <li key={note.id}>
                <NoteCard note={note} autofocus={autofocus} />
              </li>
            );
          })}
      </ItemsColumn>
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

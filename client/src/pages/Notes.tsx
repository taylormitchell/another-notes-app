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

  useHotkey("n", () => {
    if (inputFocused()) return false;
    store.addNote();
  });

  return (
    <div>
      <ItemsColumn>
        {filterByText(notes, search)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((note) => (
            <li key={note.id}>
              <NoteCard note={note} />
            </li>
          ))}
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

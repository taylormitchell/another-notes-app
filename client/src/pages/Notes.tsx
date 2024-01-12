import { CreateButton } from "../components/CreateButton";
import { ItemsColumn } from "../components/ItemsColumn";
import { NoteCard } from "../components/NoteCard";
import { useSearchContext } from "../lib/SearchContext";
import { useNotes } from "../lib/hooks";
import { useStoreContext } from "../lib/store";
import { useHotkey } from "../lib/utils";

export default function Notes() {
  const store = useStoreContext();
  const { search } = useSearchContext();
  const notes = useNotes(store);

  useHotkey("n", () => {
    const el = document.activeElement as HTMLElement;
    if (el.tagName === "INPUT") return false;
    if (el.contentEditable === "true") return false;
    store.addNote();
  });

  return (
    <div>
      <ItemsColumn>
        {notes
          .filter((note) => (search ? note.content.includes(search) : true))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((note) => (
            <li key={note.id}>
              <NoteCard note={note} />
            </li>
          ))}
      </ItemsColumn>
      <CreateButton
        onClick={() => {
          store.addNote();
        }}
      />
    </div>
  );
}

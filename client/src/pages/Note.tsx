import { useParams } from "react-router-dom";
import { useNote } from "../lib/hooks";
import { useStoreContext } from "../lib/store";
import { ItemsColumn } from "../components/ItemsColumn";

export default function Note() {
  const noteId = useParams().id ?? "";
  const store = useStoreContext();
  const note = useNote(store, noteId);
  if (!note) {
    return <div>Note not found</div>;
  }

  return <ItemsColumn children={[note]} />;
}

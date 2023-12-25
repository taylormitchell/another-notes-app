import { useNotes, useNotesWithParentIds } from "@/lib/hooks";
import { useLists } from "@/lib/reactQueries";
import { StoreContext, useStore, useStoreContext } from "@/lib/store";
import { useState, useEffect } from "react";

export function StaticNotes() {
  const store = useStoreContext();
  const notes = useNotes(store);
  return (
    <div>
      <ul>
        {notes.map((note) => {
          return (
            <li key={note.id}>
              <div>{note.content}</div>
              {/* <div>
                  {store.getNoteLists(note.id).map((l) => (
                    <span>{l.name}, </span>
                  ))}
                </div> */}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function StaticLists() {
  const store = useStoreContext();
  const lists = useLists(store);
  return (
    <div>
      <ul>
        {lists.map((list) => {
          return (
            <li key={list.id}>
              <span>{list.name}</span>
              <span> ({list.id})</span>
              <ul>
                {list.children.map((note) => (
                  <li key={note.id}>
                    <span>{note.content}</span>
                    <span> ({note.position})</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * An element which renders a value and allows it to be edited.
 * There's an edit button which toggles the element between edit and view mode.
 * In edit mode, the element is replaced with an input and the edit button is replaced with a save button.
 * On save, the value is updated and the element is replaced with the view mode.
 */
export function EditableProp({ value, onSave }: { value: string; onSave: (s: string) => void }) {
  const [inputValue, setInputValue] = useState(value);
  const [edit, setEdit] = useState(false);
  useEffect(() => {
    if (edit) return;
    setInputValue(value);
  }, [edit, value]);
  return (
    <div>
      {edit ? (
        <span>
          <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
          <button onClick={() => setEdit(false)}>Cancel</button>
          <button
            onClick={() => {
              onSave(inputValue);
              setEdit(false);
            }}
          >
            Save
          </button>
        </span>
      ) : (
        <span>
          <span>{value}</span>
          <button onClick={() => setEdit(true)}>Edit</button>
        </span>
      )}
    </div>
  );
}

function CreateNoteInput() {
  const store = useStoreContext();
  const [newContent, setNewContent] = useState("");
  return (
    <div>
      <input
        value={newContent}
        onChange={(e) => {
          setNewContent(e.target.value);
        }}
        className="full-width"
      />
      <button onClick={() => store.addNote({ content: newContent })}>+</button>
    </div>
  );
}

export function EditableNotes() {
  const store = useStoreContext();
  //   const notes = useNotes(store);
  const notes = useNotesWithParentIds(store);
  return (
    <div>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <div>
              <div>
                <EditableProp
                  value={note.content}
                  onSave={(s) => store.updateNote({ id: note.id, content: s })}
                />
                <EditableProp
                  value={note.parentIds.join(", ")}
                  onSave={(s) => {
                    store.setNoteParents({
                      noteId: note.id,
                      listIds: s.split(",").map((s) => s.trim()),
                    });
                  }}
                />
              </div>
              <button
                onClick={() => {
                  store.deleteNote(note.id);
                }}
              >
                x
              </button>
            </div>
          </li>
        ))}
      </ul>
      <CreateNoteInput />
    </div>
  );
}

function CreateListInput() {
  const store = useStoreContext();
  const [newList, setNewList] = useState("");
  return (
    <div>
      <input
        value={newList}
        onChange={(e) => {
          setNewList(e.target.value);
        }}
        className="full-width"
      />
      <button onClick={() => store.addList({ id: newList, name: newList })}>+</button>
    </div>
  );
}

export function EditableLists() {
  const store = useStoreContext();
  const lists = useLists(store);
  return (
    <div>
      <ul>
        {lists.map((list) => (
          <li key={list.id}>
            <div>
              <div>
                <EditableProp
                  value={list.name}
                  onSave={(s) => store.updateList({ id: list.id, name: s })}
                />
              </div>
              <button
                onClick={() => {
                  store.deleteList(list.id);
                }}
              >
                x
              </button>
            </div>
          </li>
        ))}
      </ul>
      <CreateListInput />
    </div>
  );
}

const Data = () => {
  const { store, isLoading } = useStore();
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <StoreContext.Provider value={store}>
      <div
        className="app"
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "200px",
          }}
        >
          <p>Notes</p>
          <StaticNotes />
        </div>
        <div
          style={{
            width: "200px",
          }}
        >
          <p>Lists</p>
          <StaticLists />
        </div>

        <div
          style={{
            width: "300px",
          }}
        >
          <p>Editable Notes</p>
          <EditableNotes />
        </div>
        <div
          style={{
            width: "300px",
          }}
        >
          <p>Editable Lists</p>
          <EditableLists />
        </div>
      </div>
      {/* <button
          onClick={() => {
            dumpStoreToApi(store);
          }}
        >
          Save
        </button> */}
    </StoreContext.Provider>
  );
};

export default Data;

import { useState } from "react";
import { useCreateNoteMutation } from "../types/graphql";

export default () => {
  // create note mutation
  const [createNote] = useCreateNoteMutation();
  const [notes, setNotes] = useState([]);
  const [lists, setLists] = useState([]); // TODO: useAllListsQuery

  // form to create a new note
  return (
    <div>
      <div>
        <span>Lists:</span>
        <input
          type="text"
          defaultValue={lists}
          onChange={(e) => {
            setLists(e.target.value);
          }}
        />
      </div>
      <div>
        {notes.map((note) => (
          <div key={note.id}>{note.text}</div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const text = (e.target as any).text.value;
          createNote({
            variables: { text, author: "Taylor" },
          }).then((res) => {
            setNotes((prev) => [...prev, res.data.createNote]);
          });
          e.currentTarget.reset();
        }}
      >
        <label>
          Text:
          <input type="text" name="text" />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

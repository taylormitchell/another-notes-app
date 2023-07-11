import { useRouter } from "next/router";
import { Note, useGetNoteQuery } from "../../types/graphql";

export default () => {
  const router = useRouter();
  const id = parseInt(typeof router.query.noteId === "string" ? router.query.noteId : "-1");

  const { loading, error, data } = useGetNoteQuery({
    variables: { id },
  });

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error(error);
    return (
      <div>
        <p>Error :(</p>
        <p>{error.message}</p>
      </div>
    );
  }

  const note = data.getNote;
  return (
    <div>
      <h2>id: {note.id}</h2>
      <p>text: {note.text}</p>
    </div>
  );
};

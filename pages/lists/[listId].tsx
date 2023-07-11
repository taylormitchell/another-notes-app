// pages/list/[id].tsx
import { useRouter } from "next/router";
import { Note, useGetListQuery } from "../../types/graphql";

// /list/[id].tsx
const List = () => {
  const router = useRouter();
  const id = parseInt(typeof router.query.listId === "string" ? router.query.listId : "-1");
  console.log(id);

  const { loading, error, data } = useGetListQuery({
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

  const list = data.getList;
  console.log(list);

  return (
    <div>
      <h2>{list.name}</h2>
      {list.notes.map((note: Note) => (
        <div key={note.id}>
          <p>{note.text}</p>
        </div>
      ))}
    </div>
  );
};

export default List;

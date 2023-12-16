import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { uuid } from "./utils";

type Note = {
  id: string;
  content: string;
  created_at: string; // assuming each note has a created_at field
};

export function useGetNotes() {
  const { data: notes, isLoading } = useQuery<Note[]>("notes", async () => {
    const result = await axios.post("/api/db", [
      {
        query: `
              SELECT id, content, created_at
              FROM note
              ORDER BY created_at DESC
            `,
      },
    ]);
    return result.data;
  });
  return { notes, isLoading };
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(
    async (note: { id: string; content: string; created_at: string }) => {
      await axios.post("/api/db", [
        {
          query: `insert into note (id, content) values ($1, $2)`,
          params: [note.id, note.content],
        },
      ]);
    },
    {
      onMutate: (note) => {
        const notes = queryClient.getQueryData<Note[]>("notes");
        queryClient.setQueryData("notes", [...notes, note]);
      },
    }
  );
  return ({ content }: { content: string }) =>
    mutate({ id: uuid(), content, created_at: new Date().toISOString() });
}

export function useUpdateNote() {
  const { mutate } = useMutation(async (note: { id: string; content: string }) => {
    await axios.post("/api/db", [
      {
        query: `update note set content = $1 where id = $2`,
        params: [note.content, note.id],
      },
    ]);
  });
  return mutate;
}

//   const { mutate: updateNote } = useMutation(
//     async ({ id, content }: { id: string; content: string }) => {
//       await axios.post("/api/db", [
//         {
//           query: `update note set content = $1 where id = $2`,
//           params: [content, id],
//         },
//       ]);
//     },
//     {
//       onMutate: (note) => {
//         const list = queryClient.getQueryData(["create", listId]) as List;
//         const updatedList = {
//           ...list,
//           children: list.children.map((c) => {
//             if (c.type === "note" && c.id === note.id) {
//               return { ...c, content: note.content };
//             }
//             return c;
//           }),
//         };
//         queryClient.setQueryData(["create", listId], updatedList);
//       },
//     }
//   );

//   const { mutate: updatePosition } = useMutation(
//     async ({ id, position }: { id: string; position: string }) => {
//       await axios.post("/api/db", [
//         {
//           query: `update list_entries set position = $1 where child_note_id = $2`,
//           params: [position, id],
//         },
//       ]);
//     },
//     {
//       onMutate: (note) => {
//         const list = queryClient.getQueryData(["create", listId]) as List;
//         const updatedList = {
//           ...list,
//           children: list.children.map((c) => {
//             if (c.type === "note" && c.id === note.id) {
//               return { ...c, position: note.position };
//             }
//             return c;
//           }),
//         };
//         queryClient.setQueryData(["create", listId], updatedList);
//       },
//     }
//   );

//   const { mutate: deleteNote } = useMutation(
//     async (id: string) => {
//       await axios.post("/api/db", [
//         {
//           query: `delete from note where id = $1`,
//           params: [id],
//         },
//       ]);
//     },
//     {
//       onMutate: (id) => {
//         const list = queryClient.getQueryData(["create", listId]) as List;
//         const updatedList = {
//           ...list,
//           children: list.children.filter((c) => c.type === "note" && c.id !== id),
//         };
//         queryClient.setQueryData(["create", listId], updatedList);
//       },
//     }
//   );

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { FIRST_POSITION, uuid } from "./utils";
import { Note, List } from "@/types";

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

// export function useCreateNote() {
//   const queryClient = useQueryClient();
//   const { mutate } = useMutation(
//     async (note: { id: string; content: string; created_at: string }) => {
//       await axios.post("/api/db", [
//         {
//           query: `insert into note (id, content) values ($1, $2)`,
//           params: [note.id, note.content],
//         },
//       ]);
//     },
//     {
//       onMutate: (note) => {
//         const notes = queryClient.getQueryData<Note[]>("notes");
//         queryClient.setQueryData("notes", [...notes, note]);
//       },
//     }
//   );
//   return ({ content }: { content: string }) =>
//     mutate({ id: uuid(), content, created_at: new Date().toISOString() });
// }

export function useCreateNote() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(
    async (note: {
      id: string;
      content: string;
      created_at: string;
      listPositions: { listId: string; position: string }[];
    }) => {
      // Get first position in each list
      await axios.post("/api/db", [
        {
          query: `insert into note (id, content) values ($1, $2)`,
          params: [note.id, note.content],
        },
        // TODO: not working
        // ...note.listPositions.map(({ listId, position }) => ({
        //   query: `insert into list_entries (parent_list_id, child_note_id, position) values ($1, $2, $3)`,
        //   params: [listId, note.id, position],
        // })),
      ]);
    },
    {
      onMutate: (note) => {
        const notes = queryClient.getQueryData<Note[]>("notes") ?? [];
        queryClient.setQueryData<Note[]>("notes", [
          ...notes,
          { id: note.id, content: note.content, created_at: note.created_at },
        ]);
        // TODO: not working
        // note.listPositions.forEach(({ listId, position }) => {
        //   const list = queryClient.getQueryData<ListWithChildren>(["list", listId]);
        //   queryClient.setQueryData<ListWithChildren>(["list", listId], {
        //     ...list,
        //     children: [
        //       ...list.children,
        //       {
        //         type: "note",
        //         id: note.id,
        //         content: note.content,
        //         created_at: note.created_at,
        //         position,
        //       },
        //     ],
        //   });
        // });
      },
    }
  );
  return async ({ content, listIds = [] }: { content: string; listIds?: string[] }) => {
    const positions = (await Promise.all(
      listIds.map(async (listId) => {
        const result = await axios.post("/api/db", [
          {
            query: `
            select position from list_entries where parent_list_id = $1 order by position asc limit 1
          `,
            params: [listId],
          },
        ]);
        return result.data[0]?.position ?? null;
      })
    )) as (string | null)[];
    mutate({
      id: uuid(),
      content,
      created_at: new Date().toISOString(),
      listPositions: listIds.map((listId, i) => ({
        listId,
        position: positions[i] ?? FIRST_POSITION,
      })),
    });
  };
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

export function useLists() {
  return useQuery<List[]>("lists", async () => {
    const result = await axios.post("/api/db", [
      {
        query: `select id, name, created_at from list`,
      },
    ]);
    return result.data;
  });
}

type NoteAsChild = Note & { type: "note" };

type ListWithChildren = {
  type: "list";
  id: string;
  name: string;
  created_at: string;
  children: (
    | (NoteAsChild & { type: "note"; position: string })
    | (ListWithChildren & { position: string })
  )[];
};

export function useListWithChildren(listId: string) {
  return useQuery<ListWithChildren>(["list", listId], async () => {
    const result = await axios.post("/api/db", [
      {
        query: `
        select 
          list.id, list.name, list.created_at, 
          list_entries.position, list_entries.child_note_id, 
          list_entries.child_list_id, 
          child_note.created_at child_note_created_at, child_note.content child_note_content,
          child_list.created_at child_list_created_at, child_list.name child_list_name
        from list 
        left join list_entries on list.id = list_entries.parent_list_id 
        left join note as child_note on list_entries.child_note_id = child_note.id 
        left join list as child_list on list_entries.child_list_id = child_list.id 
        where list.id = $1`,
        params: [listId],
      },
    ]);
    const data = result.data;
    const list: ListWithChildren = {
      type: "list",
      id: data[0].id,
      name: data[0].name,
      created_at: data[0].created_at,
      children: [],
    };
    data.forEach((row) => {
      if (row.child_note_id) {
        list.children.push({
          type: "note",
          id: row.child_note_id,
          created_at: row.child_note_created_at,
          content: row.child_note_content,
          position: row.position,
        });
      }
      if (row.child_list_id) {
        list.children.push({
          type: "list",
          id: row.child_list_id,
          created_at: row.child_list_created_at,
          name: row.child_list_name,
          position: row.position,
          children: [],
        });
      }
    });
    return list;
  });
}

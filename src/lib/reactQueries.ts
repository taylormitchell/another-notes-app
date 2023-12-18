import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { FIRST_POSITION, generatePositionBetween, uuid } from "./utils";
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

type TopPositions = { [key: string]: string | null };

/**
 * Returns an object with every lists top position like { [listId]: topPosition }
 */
export function useAllTopPositions() {
  return useQuery<TopPositions>("allTopPositions", async () => {
    const [positions, lists] = await Promise.all([
      // order by position desc, group by parent_list_id, take first
      axios.post<[{ parent_list_id: string; position: string }]>("/api/db", [
        {
          query: `
            SELECT parent_list_id, MIN(position) AS position
            FROM list_entries
            GROUP BY parent_list_id;
          `,
        },
      ]),
      axios.post<List[]>("/api/db", [
        {
          query: `
            select id from list
          `,
        },
      ]),
    ]);
    const positionsObj: TopPositions = positions.data.reduce(
      (acc: TopPositions, { parent_list_id, position }) => {
        acc[parent_list_id] = position;
        return acc;
      },
      {}
    );
    lists.data.forEach(({ id }) => {
      positionsObj[id] = positionsObj[id] ?? null;
    });
    console.log("positionsObj", positionsObj);
    return positionsObj;
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  const { data: allTopPositions } = useAllTopPositions();
  console.log("allTopPositions", allTopPositions);
  const { mutate } = useMutation(
    async (note: {
      id: string;
      content: string;
      created_at: string;
      listPositions: { listId: string; position: string }[];
    }) => {
      console.log("note", note);
      // Get first position in each list
      await axios.post("/api/db", [
        {
          query: `insert into note (id, content) values ($1, $2)`,
          params: [note.id, note.content],
        },
        ...note.listPositions.map(({ listId, position }) => ({
          query: `insert into list_entries (parent_list_id, child_note_id, position) values ($1, $2, $3)`,
          params: [listId, note.id, position],
        })),
      ]);
    },
    {
      onMutate: ({ id, content, created_at, listPositions }) => {
        const notes = queryClient.getQueryData<Note[]>("notes") ?? [];
        const note: Note = { id, content, created_at };
        queryClient.setQueryData<Note[]>("notes", [...notes, note]);
        listPositions.forEach(({ listId, position }) => {
          const list = queryClient.getQueryData<ListWithChildren>(["list", listId]);
          queryClient.setQueryData<ListWithChildren>(["list", listId], {
            ...list,
            children: [
              ...list.children,
              {
                type: "note",
                id,
                content,
                created_at,
                position,
              },
            ],
          });
        });
      },
    }
  );
  return async ({ content, listIds = [] }: { content: string; listIds?: string[] }) => {
    mutate({
      id: uuid(),
      content,
      created_at: new Date().toISOString(),
      listPositions: listIds.map((listId) => ({
        listId,
        position: allTopPositions[listId]
          ? generatePositionBetween(null, allTopPositions[listId])
          : FIRST_POSITION,
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

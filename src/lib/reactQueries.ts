import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { FIRST_POSITION, generatePositionBetween, uuid } from "./utils";
import { Note, List } from "@/types";

export function useGetCachedListWithChildren() {
  const queryClient = useQueryClient();
  return (listId: string): ListWithChildren | undefined => {
    return queryClient.getQueryData<ListWithChildren | undefined>(["list", listId]);
  }
}

export function useGetCachedNotes() {
  const queryClient = useQueryClient();
  return (): Note[] => queryClient.getQueryData<Note[]>("notes") ?? [];
}

// export function useSetCachedListWithChildren() {
//   const queryClient = useQueryClient();
//   return (listId: string, updater: ListWithChildren | ((list: ListWithChildren) => ListWithChildren)
//     ) => {
//     queryClient.setQueryData<ListWithChildren | undefined>(["list", listId], (oldList) => {
//       if (!oldList) return oldList;
//       return typeof updater === "function" ? updater(oldList) : updater;
//     });
//   }
// }

export function useSetCachedListWithChildren() {
  const queryClient = useQueryClient();
  return (updater: (list: ListWithChildren) => ListWithChildren
    ) => {
    queryClient.setQueryData<ListWithChildren[] | undefined>(["listsWithChildren"], (oldLists) => {
      if (!oldLists) return [];
      return oldLists.map((list) => updater(list));
    });
  }
}

function useSetCachedNotes() {
  const queryClient = useQueryClient();
  return (updater: Note[] | ((notes: Note[]) => Note[])) => {
    queryClient.setQueryData<Note[]>("notes", (oldNotes) => {
      return typeof updater === "function" ? updater(oldNotes ?? []) : updater;
    });
  }
}

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
    return positionsObj;
  });
}

export function useCreateNote() {
  const setCachedNotes = useSetCachedNotes();
  const setCachedListWithChildren = useSetCachedListWithChildren();
  const { data: allTopPositions } = useAllTopPositions();
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
        ...note.listPositions.map(({ listId, position }) => ({
          query: `insert into list_entries (parent_list_id, child_note_id, position) values ($1, $2, $3)`,
          params: [listId, note.id, position],
        })),
      ]);
    },
    {
      onMutate: ({ id, content, created_at, listPositions }) => {
        setCachedNotes((oldNotes) => [...oldNotes, { id, content, created_at}]);
        listPositions.forEach(({ listId, position }) => {
          setCachedListWithChildren((list) => {
            if (list.id !== listId) return list;
            return {
              ...list,
              children: [
                ...list.children,
                { type: "note", id, content, created_at, position },
              ],
            };
          });
        });
      },
    }
  );
  return async ({ content = "", listPositions = [] }: { content?: string; listPositions?: { id: string, position?: string }[] }) => {
    mutate({
      id: uuid(),
      content,
      created_at: new Date().toISOString(),
      listPositions: listPositions.map(({ id, position }) => ({
        listId: id,
        position: position ? position : allTopPositions?.[id]
          ? generatePositionBetween(null, allTopPositions[id])
          : FIRST_POSITION,
      })),
    });
  };
}

export function useUpdateNote() {
  const setCachedNotes = useSetCachedNotes();
  const setCachedListWithChildren = useSetCachedListWithChildren();
  const { mutate } = useMutation(async (note: { id: string; content: string }) => {
    await axios.post("/api/db", [
      {
        query: `update note set content = $1 where id = $2`,
        params: [note.content, note.id],
      },
    ]);
  }, {
    onMutate: ({ id, content }) => {
      setCachedNotes((oldNotes) => {
        return oldNotes.map((note) => {
          if (note.id === id) {
            return { ...note, content };
          }
          return note;
        });
      });
      setCachedListWithChildren((list) => {
        return {
          ...list,
          children: list.children.map((child) => {
            if (child.id === id) {
              return { ...child, content };
            }
            return child;
          }),
        };
      });
    }
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

const NO_RESULT = { type: "none" } as const;

export function useListWithChildren(listId: string) {
  return useQuery(["list", listId], async () => {
    if (!listId) return NO_RESULT;
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
    if (data.length === 0) return NO_RESULT;
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

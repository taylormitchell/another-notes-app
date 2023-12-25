import Link from "next/link";
import { uuid } from "../../lib/utils";
import { useStoreContext } from "@/lib/store";
import { useLists } from "@/lib/hooks";

export default function Lists() {
  const store = useStoreContext();
  const lists = useLists(store);
  return (
    <div>
      <ul>
        {lists.map((list) => (
          <li key={list.id}>
            <span className="flex justify-between items-center">
              <Link href={`/lists/${list.id}`}>
                {list.name ? <b>{list.name}</b> : <em>untitled</em>}
              </Link>
              <button
                className="w-8"
                onClick={() => {
                  store.deleteList(list.id);
                }}
              >
                x
              </button>
            </span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => {
          const id = uuid();
          const name = new Date().getTime().toString();
          store.addList({ id, name });
        }}
      >
        +
      </button>
    </div>
  );
}

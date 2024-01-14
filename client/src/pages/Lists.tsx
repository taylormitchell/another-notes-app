import { Link } from "react-router-dom";
import { useLists } from "../lib/hooks";
import { useStoreContext } from "../lib/store";
import { uuid } from "../lib/utils";
import { CreateButton } from "../components/CreateButton";
import { useModalsContext } from "../lib/modalContext";
import { useSearchContext } from "../lib/SearchContext";
import { env } from "../lib/env";

export default function Lists() {
  const store = useStoreContext();
  const lists = useLists(store);
  const listModal = useModalsContext().createList;
  const { search } = useSearchContext();
  return (
    <div>
      <ul>
        {lists
          .filter((list) => !!list.name)
          .filter((list) => (search ? list.name.includes(search) : true))
          .map((list) => (
            <li key={list.id}>
              <span className="flex justify-between items-center">
                <Link to={`/lists/${list.id}`}>
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
      {env.isTouchDevice && <CreateButton onClick={listModal.open} />}
    </div>
  );
}

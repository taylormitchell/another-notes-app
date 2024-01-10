import { Link } from "react-router-dom";
import { List } from "../types";

export function ListCard({ list }: { list: List }) {
  return (
    <div className="p-4">
      <Link to={`/lists/${list.id}`}>
        <h3 className="text-l font-bold">{list.name}</h3>
        <div>...</div>
      </Link>
    </div>
  );
}

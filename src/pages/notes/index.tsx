import { useGetNotes } from "@/lib/noteMutations";

export default function Notes() {
  const { notes, isLoading } = useGetNotes();
  if (isLoading) return <div>Loading...</div>;
  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      <h1 className="text-2xl font-bold text-center my-4">Notes</h1>
      <ul className="space-y-4">
        {notes.map((note) => (
          <li
            key={note.id}
            className="max-w-lg mx-auto border border-gray-300 rounded cursor-pointer hover:bg-gray-100"
          >
            <div className="rounded overflow-hidden shadow-md bg-white">
              <div
                className="p-4"
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
              <div className="p-4 text-gray-600 text-sm">
                {new Date(note.created_at).toLocaleString()}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

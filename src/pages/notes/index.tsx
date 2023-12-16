import { useGetNotes } from "@/lib/noteMutations";

export default function Notes() {
  const { notes, isLoading } = useGetNotes();
  if (isLoading) return <div>Loading...</div>;
  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      <h1>Notes</h1>
      <ul className="w-full space-y-4 p-4">
        {notes
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((note) => (
            <li key={note.id}>
              <div className="p-3 space-y-2 rounded overflow-hidden shadow-md bg-white border border-gray-300">
                <p
                  className="w-full"
                  contentEditable
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
                <div className="text-gray-600 text-sm">
                  {new Date(note.created_at).toLocaleString()}
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}

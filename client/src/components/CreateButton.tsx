export function CreateButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="fixed bottom-4 right-4 w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center"
      onClick={onClick}
    >
      +
    </button>
  );
}

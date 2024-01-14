import { ReactNode } from "react";

export function ItemsColumn({ children }: { children: ReactNode }) {
  return (
    <main className="max-w-2xl mx-auto flex flex-col items-center">
      <ul className="w-full">{children}</ul>
    </main>
  );
}

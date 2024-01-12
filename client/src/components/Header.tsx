import { ReactNode } from "react";

export function Header({ children }: { children?: ReactNode }) {
  return <header className="flex justify-between p-4 items-center">{children}</header>;
}

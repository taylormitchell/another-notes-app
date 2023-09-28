import { v4 } from "uuid";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const uuid = v4;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

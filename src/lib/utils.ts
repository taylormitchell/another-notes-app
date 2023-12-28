import { v4 } from "uuid";
import { generateKeyBetween } from "fractional-indexing";

export const uuid = v4;

/**
 * Same as {@link generateKeyBetween}, but doesn't throw if a and b are equal.
 */
export function generatePositionBetween(
  a: string | null | undefined,
  b: string | null | undefined,
  digits?: string
) {
  if (a && b && a === b) {
    return a;
  }
  return generateKeyBetween(a, b, digits);
}

export const FIRST_POSITION = generateKeyBetween(null, null);

export function sortByPosition<T extends { position: string; created_at: string }>(
  a: T,
  b: T
): number {
  if (a.position < b.position) return -1;
  if (a.position > b.position) return 1;
  if (a.created_at && b.created_at) {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }
  return 0;
}

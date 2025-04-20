import { capitalise } from "./capitalise";

export function formatErrorTitle(summary: string): string {
  const words = summary.split(/[_-]/).map((word) => capitalise(word));

  return words.join(" ");
}

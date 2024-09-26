import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { diacritics, diacriticsCodePoints } from "./diacritics";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type DifficultyType = "easy" | "medium" | "hard";

export const difficultyItems: { value: DifficultyType; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export const convertToCodepoints = (str: string) => {
  return [...str].map((c) => c.codePointAt(0) as number);
};

const SHADDA_CODEPOINT = 1617;

// ensure any shadda is before its corresponding haraka
export const orderShadda = (arr: number[]) => {
  const result = [];
  let pos = 0;

  while (pos < arr.length) {
    if (
      arr[pos] !== SHADDA_CODEPOINT &&
      diacriticsCodePoints.includes(arr[pos]) &&
      arr[pos + 1] === SHADDA_CODEPOINT
    ) {
      result.push(arr[pos + 1]);
      result.push(arr[pos]);
      pos += 2;
    } else {
      result.push(arr[pos]);
      pos += 1;
    }
  }

  return result;
};

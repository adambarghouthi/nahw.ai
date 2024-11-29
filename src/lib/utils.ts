import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { diacriticsCodePoints } from "./diacritics";
import { removeZwj } from "./shaping";

export type DifficultyType = "easy" | "medium" | "hard";

const SHADDA_CODEPOINT = 1617;

export const difficultyItems: { value: DifficultyType; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export const difficultyPrompt: Record<
  DifficultyType,
  (topic: string) => string
> = {
  easy: (topic: string) =>
    `Generate a short (5-6 words) arabic sentence that you would find in a children's book on the topic of ${topic}`,
  medium: (topic: string) =>
    `Generate a short (7-8 words) arabic sentence that you would find in novels and history books on the topic of ${topic}`,
  hard: (topic: string) =>
    `Generate a short (9-11 words) arabic sentence that you would find in classical textbooks and writings like hadith on the topic of ${topic}`,
};

export const topics: string[] = [
  "Productivity",
  "Politics",
  "Sports",
  "Technology",
  "Health",
  "Finance",
  "Religion",
  "Education",
  "Entertainment",
  "Science",
  "Travel",
  "Lifestyle",
  "Environment",
  "Business",
  "Food",
  "Art",
  "History",
  "Literature",
  "Music",
  "Gaming",
  "Fashion",
];

export const wordContextActions = {
  IRAB: "irab",
  DEFINITION: "definition",
  ADD_TO_VOCABULARY: "add_to_vocabulary",
};

export function getRandomTopic(): string {
  const randomIndex = Math.floor(Math.random() * topics.length);
  return topics[randomIndex];
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertToCodepoints = (str: string) => {
  return [...str].map((c) => c.codePointAt(0) as number);
};

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

export const getCodepointIdx = (index: number, charGroups: string[]) => {
  let codePointIdx = 0;

  for (let i = 0; i < index; i++) {
    const charGroupWithoutZwj = removeZwj(charGroups[i]);
    codePointIdx += charGroupWithoutZwj.length;
  }

  return codePointIdx;
};

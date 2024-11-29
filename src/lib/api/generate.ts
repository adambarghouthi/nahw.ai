import { DifficultyType } from "../utils";

export default async function generate(difficulty: DifficultyType) {
  const res = await fetch("/api/generate", {
    method: "POST",
    body: JSON.stringify({ difficulty }),
  });

  const json = await res.json();

  return json;
}

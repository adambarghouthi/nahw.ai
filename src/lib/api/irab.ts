export default async function irab(word: string, sentence: string) {
  const res = await fetch("/api/irab", {
    method: "POST",
    body: JSON.stringify({ word, sentence }),
  });

  const json = await res.json();

  return json;
}

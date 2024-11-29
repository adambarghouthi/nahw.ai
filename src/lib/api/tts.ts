export default async function tts(sentence: string) {
  const response = await fetch("/api/tts", {
    method: "POST",
    body: `Say this sentence: ${sentence}`,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  console.time("jsonParse");
  const data = await response.json();
  console.timeEnd("jsonParse");
  console.log("Response data parsed");

  if (data.error) {
    throw new Error(data.error);
  }

  if (data.audioData && data.audioMimeType) {
    return data;
  } else {
    throw new Error("Ooops, no audio received");
  }
}

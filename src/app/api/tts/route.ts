import { NextRequest, NextResponse } from "next/server";
import WebSocket from "ws";

let ws: WebSocket | null = null;

function getWebSocket(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    console.time("websocketConnection");
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.timeEnd("websocketConnection");
      console.log("Using existing WebSocket connection");
      resolve(ws);
    } else {
      const url =
        "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";
      ws = new WebSocket(url, {
        headers: {
          Authorization: "Bearer " + process.env.OPENAI_API_KEY,
          "OpenAI-Beta": "realtime=v1",
        },
      } as WebSocket.ClientOptions);

      ws.onopen = () => {
        console.timeEnd("websocketConnection");
        console.log("WebSocket connected");
        resolve(ws!);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        ws = null;
      };
    }
  });
}

function determineAudioMimeType(buffer: Buffer): string {
  const header = buffer.subarray(0, 4).toString("hex");
  console.log("Audio header:", header);
  if (header.startsWith("fff3") || header.startsWith("fff2"))
    return "audio/mpeg";
  if (header.startsWith("5249")) return "audio/wav"; // "RIFF" in hex
  if (header.startsWith("4f676753")) return "audio/ogg";
  if (header.startsWith("664c6143")) return "audio/flac"; // "fLaC" in hex
  return "audio/mp3"; // Default to MP3 if unknown
}

export async function POST(req: NextRequest) {
  const message = await req.text();

  try {
    console.time("socketConnection");
    const socket = await getWebSocket();
    console.timeEnd("socketConnection");

    let response = "";
    const audioChunks: Buffer[] = [];
    let isResponseComplete = false;

    const userEvent = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: message }],
      },
    };

    console.time("socketSend");
    socket.send(JSON.stringify(userEvent));
    socket.send(JSON.stringify({ type: "response.create" }));
    console.timeEnd("socketSend");

    console.time("aiResponseTime");

    await new Promise<void>((resolve, reject) => {
      const messageHandler = (data: WebSocket.Data) => {
        const parsedData = JSON.parse(data.toString());
        console.log("Received message type:", parsedData.type);

        if (parsedData.type === "error") {
          console.error("API Error:", parsedData.error);
          reject(new Error(parsedData.error.message));
          return;
        }
        if (
          parsedData.type === "conversation.item.create" &&
          parsedData.item.role === "assistant"
        ) {
          response += parsedData.item.content[0].text;
        }
        if (parsedData.type === "response.audio.delta") {
          const chunk = Buffer.from(parsedData.delta, "base64");
          audioChunks.push(chunk);
        }
        if (parsedData.type === "response.done") {
          console.timeEnd("aiResponseTime");
          isResponseComplete = true;
          socket.removeListener("message", messageHandler);
          resolve();
        }
      };

      socket.on("message", messageHandler);
    });

    if (isResponseComplete) {
      const audioBuffer = Buffer.concat(audioChunks);
      console.log("Sending response:", response);
      console.log("Sending audio data, length:", audioBuffer.length);
      console.timeEnd("totalApiTime");
      return NextResponse.json({
        response: response,
        audioData: audioBuffer.toString("base64"),
        audioMimeType: determineAudioMimeType(audioBuffer),
      });
    } else {
      throw new Error("Response was not completed");
    }
  } catch (error) {
    console.error("Error in API handler:", error);
    return NextResponse.json({
      error: "An error occurred while processing the request",
    });
  }
}

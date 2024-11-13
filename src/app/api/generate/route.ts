import { NextRequest, NextResponse } from "next/server";

import { generateSentence, addTashkil } from "@/lib/openai";
import type { SentenceObjectType } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { difficulty } = body;

  try {
    const sentenceCompletion = await generateSentence(difficulty);
    const sentenceResult: SentenceObjectType = JSON.parse(
      sentenceCompletion.choices[0].message.content as string
    );

    const tashkilCompletion = await addTashkil(sentenceResult.arabic);
    const tashkilResult: string = tashkilCompletion.choices[0].message
      .content as string;

    return NextResponse.json({
      response: {
        ...sentenceResult,
        arabic: tashkilResult,
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: error,
    });
  }
}

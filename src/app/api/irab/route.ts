import { NextRequest, NextResponse } from "next/server";

import { getIrab } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { word, sentence } = body;

  try {
    const irabCompletion = await getIrab(word, sentence);
    const irabResult: string = irabCompletion.choices[0].message
      .content as string;

    return NextResponse.json({
      response: {
        irab: irabResult,
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: error,
    });
  }
}

import OpenAI from "openai";

import { difficultyPrompt, DifficultyType, getRandomTopic } from "./utils";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type SentenceObjectType = {
  arabic: string;
  translation: string;
  word_mapping: {
    arabic: string;
    translation: string;
    index: number;
  }[];
};

const addTashkil = async (sentence: string) =>
  openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are an Arabic grammar guru and you will add tashkil on Arabic sentences.",
      },
      {
        role: "user",
        content: `
          <START CONTEXT>
            You will be given an Arabic sentence with no tashkil and a set of rules to follow,
            I will ask you to apply tashkil on it and adhere to the set of rules given
          <END CONTEXT>

          <START PROMPT>
            To do: apply tashkil on this sentence: ${sentence}
            Rules you must follow:
              - Apply correct sukoon, shadda, and tanwin
              - EXTRA IMPORTANT: Tanwin can only be on the last letter
              - Imperative tense ends with sukoon if addressing the masculine
              - Make sure all the letters: ${[...sentence].join(
                ", "
              )} have a diacritic
            To return: only the diacritized sentence
          <END PROMPT>
        `,
      },
    ],
  });

const generateSentence = async (
  difficulty: DifficultyType,
  trans: string = "english"
) =>
  openai.chat.completions.create({
    model: "gpt-4o",
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "generation_response",
        schema: {
          type: "object",
          properties: {
            arabic: { type: "string" },
            translation: { type: "string" },
            word_mapping: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  arabic: { type: "string" },
                  translation: { type: "string" },
                  index: { type: "number" },
                },
                required: ["arabic", "translation", "index"],
                additionalProperties: false,
              },
            },
          },
          required: ["arabic", "translation", "word_mapping"],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: "system",
        content:
          "You are an Arabic grammar guru and you will help in crafting authentic Arabic sentences.",
      },
      {
        role: "user",
        content: `${difficultyPrompt[difficulty](
          getRandomTopic()
        )} with translation to ${trans}`,
      },
    ],
  });

export type { SentenceObjectType };
export { generateSentence, addTashkil };

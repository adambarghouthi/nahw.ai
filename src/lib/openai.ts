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
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content:
          "You are an Arabic grammar guru and you will help in crafting authentic Arabic sentences.",
      },
      {
        role: "user",
        content: `
          ${difficultyPrompt[difficulty](getRandomTopic())}

          Return the generated sentence in the following JSON:
            {
              "arabic": "string",
              "translation": "string",
              "word_mapping": [
                {
                  "arabic": "string",
                  "translation": "string",
                  "index": number
                }
              ]
            }
          Here's the definition for each key:
            - arabic: the Arabic sentence you generated
            - translation: the translation of the Arabic sentence in the ${trans} language
            - word_mapping: a word-level mapping where each element in the array links an Arabic word in the generated sentence, its translation, and its index in the sentence, where the index of the first word should start at 0.
              This structure can be used for aligning the Arabic sentence with its translation on a word-by-word basis, making it easier to map the original and translated sentences.
        `,
      },
    ],
  });

export type { SentenceObjectType };
export { generateSentence, addTashkil };

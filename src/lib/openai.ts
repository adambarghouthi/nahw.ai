"use server";

import OpenAI from "openai";

import { DifficultyType } from "./utils";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type AIJsonSchema = {
  plain: string;
  diacritic: string;
  translation: string;
  word_mapping: {
    arabic: string;
    translation: string;
    index: number;
  }[];
};

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
          You will generate a sentence based on either of 3 difficulty levels: easy, medium, or hard. Here's a definition for each:

          1. Easy Sentence (A1-A2 Level)

          Example:
            - Arabic: "الطالبُ في المدرسةِ."
            - Translation: "The student is in the school."

          Grammatical Perspective:
            - Nominal sentence: A simple sentence that starts with a noun.
            - Simple structure: This sentence consists of a subject (الطالب) and a prepositional phrase (في المدرسة).
            - Basic vocabulary: Uses common words like "student" and "school."
            - No complex conjugation or agreement: The verb "to be" is implied (as is common in Arabic), and there is no complicated verb tense or case endings beyond basic subject-predicate agreement.

          2. Medium Sentence (B1-B2 Level)

          Example:
            - Arabic: "الطلابُ يدرسونَ دروسَهم بجدٍ في المكتبة."
            - Translation: "The students study their lessons diligently in the library."

          Grammatical Perspective:
            - Verbal sentence: Begins with a subject (الطلاب) followed by a verb (يدرسون).
            - Verbal conjugation: The verb (يدرسون) is conjugated in the present tense to agree with the plural subject.
            - Complexity in phrases: Includes both a direct object (دروسهم, "their lessons") and an adverbial phrase (بجدٍ, "diligently").
            - Grammar agreement: Subject-verb agreement and the use of dual/plural forms make the sentence more complex.3. hard: جملة وهي أصعبهم فيها كل ما في الجملة المتوسطة والسهلة بالإضافة أنها تُظهر مختلف القواعد العربية التي لم يُسبق الإشارة إليها

          3. Hard Sentence (C1-C2 Level)

          Example:
            - Arabic: "لا يزالُ العقلُ البشريّ في سعيٍ دائمٍ لفهمِ أسرارِ الكونِ التي تتجلّى في أدقِّ تفاصيلِ الحياة."
            - Translation: "The human mind is in constant pursuit of understanding the mysteries of the universe, which manifest in the smallest details of life."

          Grammatical Perspective:
            - Complex verbal sentence: The sentence starts with a verb (لا يزالُ) that requires a subject (العقل البشريّ) and a predicate (في سعيٍ دائمٍ...).
            - Nested structures: The sentence contains embedded clauses (أسرارِ الكونِ التي تتجلّى...) that add depth and complexity.
            - Abstract vocabulary: Words like "mysteries," "universe," and "manifest" make it more difficult to understand and analyze.
            - Grammatical intricacies: The sentence uses advanced grammatical concepts like iḍāfa (construct state) and relative clauses (التي تتجلّى).
            - Literary style: The sentence may contain stylistic elements like poetic metaphors or abstract philosophical concepts.
            
          You must commit to the difficulty level as provided. Try your hardest to meet the definition of each level.
          
          I want you to return only JSON in the following schema:
            {
              "plain": "string", 
              "diacritic": "string", 
              "translation": "string", 
              "word_mapping": [
                {
                  "arabic": "string", 
                  "translation": "string", 
                  "index": number
                }
              ]
            }
            
          Here is the definition for each key in the above JSON:
            - plain: An Arabic sentence with absolutely NO diacritics on any of its letters.
            - diacritic: An Arabic sentence that follows the rules of Arabic Nahw (grammar) with the correct diacritics applied. The sentence should adhere to the following structure:
              - Include diacritics for proper subject-verb-object agreement and case endings.
              - Use appropriate i‘rāb (nominative, accusative, genitive) based on the sentence components.
              - Ensure verbs are conjugated correctly based on tense and subject agreement.
              - Avoid adding diacritics to the "ال" prefix.
            - translation: The translation of the plain sentence in ${trans}.
            - word_mapping: An array mapping each Arabic word (without diacritics) to its translation in ${trans}, along with its index in the plain sentence.

          Now generate a random ${difficulty} Arabic sentence and return the corresponding JSON object.
        `.trim(),
      },
    ],
  });

export type { AIJsonSchema };
export { generateSentence };

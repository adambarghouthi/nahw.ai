"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import {
  Trash,
  Languages,
  LoaderCircle,
  CircleHelp,
  Volume2,
} from "lucide-react";
import classNames from "classnames";
import { AnimatePresence } from "framer-motion";

import { removeDiacritics } from "@/lib/shaping";
import { diacritics, diacriticsCodePoints } from "@/lib/diacritics";
import type { SentenceObjectType } from "@/lib/openai";
import type { DifficultyType } from "@/lib/utils";
import {
  convertToCodepoints,
  difficultyItems,
  getCodepointIdx,
  orderShadda,
} from "@/lib/utils";
import { playAudio } from "@/lib/audio/play";
import useSentence from "@/hooks/useSentence";
import useWords from "@/hooks/useWords";

import DiacriticsMenubar from "../DiacriticsMenubar";
import Spinner from "../Spinner";
import Select from "../Select";
import Tooltip from "../Tooltip";
import Word from "../Word";
import { Button } from "../ui/button";
import { TooltipProvider } from "../ui/tooltip";

export default function Home() {
  const {
    sentence: mutableSentence,
    charGroups,
    addCharDiacritic,
    removeCharDiacritics,
    removeCharDiacritic,
    setSentence: setMutableSentence,
  } = useSentence("");

  const [generating, setGenerating] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [sentenceObject, setSentenceObject] = useState<SentenceObjectType>();
  const [difficulty, setDifficulty] = useState<DifficultyType>(
    difficultyItems[0].value
  );
  const [showDiacritics, setShowDiacritics] = useState(false);
  const [diacriticsMenuCoords, setDiacriticsMenuCoords] = useState<
    number[] | undefined
  >();
  const [selectedChar, setSelectedChar] = useState<number[] | undefined>();

  const { words } = useWords({
    sentence: sentenceObject?.arabic ?? "",
    charGroups,
    mapping: sentenceObject?.word_mapping ?? [],
  });

  const isInitialized = useRef(false);

  const isComplete = useMemo(() => {
    if (!sentenceObject || !mutableSentence) return false;

    const codePoints1 = orderShadda(convertToCodepoints(mutableSentence));
    const codePoints2 = orderShadda(convertToCodepoints(sentenceObject.arabic));

    return JSON.stringify(codePoints1) === JSON.stringify(codePoints2);
  }, [sentenceObject, mutableSentence]);

  const hasDiacritic = useMemo(() => {
    return Boolean(
      convertToCodepoints(mutableSentence).find((cp) =>
        diacriticsCodePoints.includes(cp)
      )
    );
  }, [mutableSentence]);

  const speakSentence = useCallback(async () => {
    setSpeaking(true);
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        body: `Say this sentence: ${sentenceObject?.arabic}`,
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
        console.log("Audio data received, length:", data.audioData.length);
        console.time("audioPlayback");
        await playAudio(data.audioData, data.audioMimeType, data.response);
        console.timeEnd("audioPlayback");
      } else {
        throw new Error("Ooops, no audio received");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSpeaking(false);
    }
  }, [sentenceObject]);

  const onNextClick = useCallback(
    async (d: DifficultyType) => {
      console.log("difficulty:", d);
      setGenerating(true);
      setDiacriticsMenuCoords(undefined);
      setSelectedChar(undefined);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          body: JSON.stringify({ difficulty: d }),
        });

        const json = await res.json();
        const sentenceResponse = json.response;
        setSentenceObject(sentenceResponse);
        setMutableSentence(removeDiacritics(sentenceResponse.arabic));
      } catch (error) {
        console.log(error);
      } finally {
        setGenerating(false);
      }
    },
    [setMutableSentence, removeCharDiacritic]
  );

  const onAddDiacritic = useCallback(
    (diacriticName: string) => {
      if (!selectedChar) return;

      const codePointIdx = getCodepointIdx(selectedChar[2], charGroups);

      const diacriticCodepoint = diacritics.find(
        (d) => d.name === diacriticName
      )?.codePoint as number;

      addCharDiacritic(
        codePointIdx + selectedChar[0] /* make up for spaces */,
        diacriticCodepoint
      );
    },
    [charGroups, selectedChar, addCharDiacritic]
  );

  const onRemoveDiacritic = useCallback(() => {
    if (!selectedChar) return;

    const codePointIdx = getCodepointIdx(selectedChar[2], charGroups);
    const nextCodePointIdx =
      codePointIdx + selectedChar[0] + 1; /* wIdx makes up for spaces */
    const codePointSentence = convertToCodepoints(mutableSentence);

    const hasNoDiacritic = !diacriticsCodePoints.includes(
      codePointSentence[nextCodePointIdx]
    );

    if (hasNoDiacritic) return;

    removeCharDiacritic(
      codePointIdx + selectedChar[0] /* wIdx makes up for spaces */
    );
  }, [charGroups, selectedChar, mutableSentence, addCharDiacritic]);

  const onRemoveDiacritics = useCallback(() => {
    removeCharDiacritics();
  }, [removeCharDiacritics]);

  const onDifficultyChange = useCallback(
    (value: string) => {
      const newDifficulty = value as DifficultyType;
      setDifficulty(newDifficulty);
      onNextClick(newDifficulty);
    },
    [onNextClick]
  );

  useEffect(() => {
    // initialize the first sentence
    if (!isInitialized.current) {
      isInitialized.current = true;
      onNextClick(difficulty);
    }
  }, [difficulty, onNextClick]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-neutral-900">
      <AnimatePresence>
        {diacriticsMenuCoords && (
          <DiacriticsMenubar
            coords={diacriticsMenuCoords}
            onSelect={(toggleName) => {
              if (toggleName === "trash") {
                if (selectedChar) {
                  onRemoveDiacritic();
                }
              } else if (toggleName === "close") {
                setDiacriticsMenuCoords(undefined);
                setSelectedChar(undefined);
              } else {
                if (selectedChar) {
                  onAddDiacritic(toggleName);
                }
              }
            }}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center gap-x-2 h-16">
        <p className="text-sm text-muted-foreground ">Difficulty</p>
        <Select
          items={difficultyItems}
          value={difficulty}
          onChange={onDifficultyChange}
        />
      </div>
      <div className="mt-4 text-center max-w-xs">
        <i>
          Choose your difficulty and an Arabic sentence will be generated. Hover
          over a word to see its English meaning and click a letter to add
          harakat.
        </i>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center p-2 min-h-40 max-w-md">
          {generating ? (
            <Spinner />
          ) : (
            <TooltipProvider>
              <div
                id="sentence"
                dir="rtl"
                className="flex flex-wrap justify-center relative gap-x-0.5 gap-y-4 text-white text-5xl"
              >
                {words.map((word, wordIdx) => (
                  <Word
                    key={wordIdx}
                    index={word.index}
                    translation={word.translation}
                    charGroups={word.charGroups}
                    diacriticCharGroups={word.diacriticCharGroups}
                    range={word.range}
                    showDiacritics={showDiacritics}
                    selectedChar={selectedChar}
                    onCharSelect={(wIdx, cIdx, addIdx, coords) => {
                      setSelectedChar([wIdx, cIdx, addIdx]);
                      setDiacriticsMenuCoords(coords);
                    }}
                  />
                ))}
              </div>
              {/* <Sentence
                sentence={sentenceObject?.arabic ?? ""}
                charGroups={charGroups}
                showDiacritics={showDiacritics}
                mapping={sentenceObject?.word_mapping ?? []}
                onCharSelect={onAddDiacritic}
              /> */}

              <div className="flex items-center justify-center gap-x-5 mt-8">
                <Button
                  variant={speaking ? "secondary" : "ghost"}
                  size="icon"
                  onClick={speakSentence}
                  disabled={speaking}
                >
                  {speaking ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>

                <Tooltip content={sentenceObject?.translation as string}>
                  <Button variant="ghost" size="icon">
                    <Languages className="h-4 w-4" />
                  </Button>
                </Tooltip>

                <Button
                  variant="ghost"
                  size="icon"
                  onMouseOver={() => setShowDiacritics(true)}
                  onMouseOut={() => setShowDiacritics(false)}
                >
                  <CircleHelp className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!hasDiacritic}
                  onClick={onRemoveDiacritics}
                >
                  <Trash className="h-4 w-4 me-1" /> Remove harakat
                </Button>
              </div>
            </TooltipProvider>
          )}
        </div>

        {!generating && (
          <div className="mt-6">
            <Button
              className={classNames(
                isComplete ? "bg-green-500 hover:bg-green-700" : ""
              )}
              variant="secondary"
              size="sm"
              onClick={() => onNextClick(difficulty)}
            >
              {isComplete ? "Next sentence" : "New sentence"}
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center justify-center py-3">
        <div className="max-w-md leading-5 rounded-md mb-4 px-2 py-1 bg-red-400 bg-opacity-40">
          <b>Precaution:</b> keep in mind this is still an experimental tool, so
          the AI can make mistakes in tashkil, translation, pronunciation, and
          sentence generation.
        </div>
        <p className="text-sm text-muted-foreground">
          Developed by Adam Albarghouthi
        </p>
      </div>
    </div>
  );
}

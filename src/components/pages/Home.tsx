"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { Trash, Languages, CircleHelp, Redo, Undo } from "lucide-react";

import { removeDiacritics, removeZwj } from "@/lib/shaping";
import { diacritics, diacriticsCodePoints } from "@/lib/diacritics";
import { generateSentence } from "@/lib/openai";
import type { SentenceObjectType } from "@/lib/openai";
import type { DifficultyType } from "@/lib/utils";
import { convertToCodepoints, difficultyItems, orderShadda } from "@/lib/utils";
import useSentence from "@/hooks/useSentence";
import useActions from "@/hooks/useActions";

import Sentence from "../Sentence";
import DiacriticsMenubar from "../DiacriticsMenubar";
import Spinner from "../Spinner";
import Select from "../Select";
import Tooltip from "../Tooltip";
import { Button } from "../ui/button";
import { TooltipProvider } from "../ui/tooltip";
import classNames from "classnames";

export default function Home() {
  const {
    sentence: mutableSentence,
    charGroups,
    addCharDiacritic,
    removeCharDiacritics,
    removeCharDiacritic,
    setSentence: setMutableSentence,
  } = useSentence("");
  const {
    addAction,
    undoDisabled,
    redoDisabled,
    getUndoAction,
    getRedoAction,
    resetActions,
  } = useActions();

  const [selectedToggle, setSelectedToggle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sentenceObject, setSentenceObject] = useState<SentenceObjectType>();
  const [difficulty, setDifficulty] = useState<DifficultyType>(
    difficultyItems[0].value
  );
  const [showDiacritics, setShowDiacritics] = useState(false);

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

  const onNextClick = useCallback(
    async (d: DifficultyType) => {
      console.log("difficulty:", d);
      try {
        setLoading(true);
        setSelectedToggle(null);

        const completion = await generateSentence(d);
        const result: SentenceObjectType = JSON.parse(
          completion.choices[0].message.content as string
        );
        console.log(result);
        setSentenceObject(result);
        setMutableSentence(removeDiacritics(result.arabic));
        resetActions();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    },
    [setMutableSentence, resetActions]
  );

  const onAddDiacritic = useCallback(
    (cIdx: number) => {
      if (!selectedToggle) return;

      let codePointIdx = 0;

      for (let i = 0; i < cIdx; i++) {
        const charGroupWithoutZwj = removeZwj(charGroups[i]);
        codePointIdx += charGroupWithoutZwj.length;
      }

      const diacriticCodepoint = diacritics.find(
        (d) => d.name === selectedToggle
      )?.codePoint as number;

      addCharDiacritic(codePointIdx, diacriticCodepoint);
      addAction({ pos: codePointIdx, diacritic: diacriticCodepoint });
    },
    [charGroups, selectedToggle, addCharDiacritic, addAction]
  );

  const onRemoveDiacritics = useCallback(() => {
    removeCharDiacritics();
    resetActions();
  }, [removeCharDiacritics, resetActions]);

  const onDifficultyChange = useCallback(
    (value: string) => {
      const newDifficulty = value as DifficultyType;
      setDifficulty(newDifficulty);
      onNextClick(newDifficulty);
    },
    [onNextClick]
  );

  const onUndoClick = useCallback(() => {
    const action = getUndoAction();
    if (action) removeCharDiacritic(action.pos);
  }, [getUndoAction, removeCharDiacritic]);

  const onRedoClick = useCallback(() => {
    const action = getRedoAction();
    if (action) addCharDiacritic(action.pos, action.diacritic);
  }, [getRedoAction, addCharDiacritic]);

  useEffect(() => {
    // initialize the first sentence
    if (!isInitialized.current) {
      isInitialized.current = true;
      onNextClick(difficulty);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900">
      <div className="flex items-center justify-center gap-x-2 h-16">
        <p className="text-sm text-muted-foreground ">Difficulty</p>
        <Select
          items={difficultyItems}
          value={difficulty}
          onChange={onDifficultyChange}
        />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-3">
          <DiacriticsMenubar
            selected={selectedToggle}
            onSelect={setSelectedToggle}
          />
          <p className="min-h-6 italic mt-1 text-sm text-muted-foreground text-center">
            {selectedToggle ? `Selected ${selectedToggle}` : null}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center p-2 min-h-40 max-w-md">
          {loading ? (
            <Spinner />
          ) : (
            <TooltipProvider>
              <Sentence
                sentence={sentenceObject?.arabic}
                charGroups={charGroups}
                showDiacritics={showDiacritics}
                mapping={sentenceObject?.word_mapping ?? []}
                onCharSelect={onAddDiacritic}
              />

              <div className="flex items-center justify-center gap-x-5 mt-8">
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

                <div className="space-x-1">
                  <Tooltip content="Undo">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={undoDisabled}
                      onClick={onUndoClick}
                    >
                      <Undo className="h-4 w-4" />
                    </Button>
                  </Tooltip>

                  <Tooltip content="Redo">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={redoDisabled}
                      onClick={onRedoClick}
                    >
                      <Redo className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </TooltipProvider>
          )}
        </div>

        {!loading && mutableSentence && hasDiacritic && !isComplete && (
          <div className="mt-6">
            <Button variant="link" size="sm" onClick={onRemoveDiacritics}>
              <Trash className="h-4 w-4 me-1" /> Remove harakat
            </Button>
          </div>
        )}

        {!loading && (
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
      <div className="flex items-center justify-center h-16">
        <p className="text-sm text-muted-foreground">
          Developed by Adam Albarghouthi
        </p>
      </div>
    </div>
  );
}

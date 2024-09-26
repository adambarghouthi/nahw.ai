"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { Trash, Languages, CircleHelp, Redo, Undo } from "lucide-react";

import { removeZwj } from "@/lib/shaping";
import { diacritics } from "@/lib/diacritics";
import { generateSentence } from "@/lib/openai";
import type { AIJsonSchema } from "@/lib/openai";
import type { DifficultyType } from "@/lib/utils";
import { difficultyItems } from "@/lib/utils";
import useSentence from "@/hooks/useSentence";

import Sentence from "../Sentence";
import DiacriticsMenubar from "../DiacriticsMenubar";
import { Button } from "../ui/button";
import { TooltipProvider } from "../ui/tooltip";
import Spinner from "../Spinner";
import Select from "../Select";
import Tooltip from "../Tooltip";
import HelpTooltipContent from "../HelpTooltipContent";
import useActions from "@/hooks/useActions";

export default function Home() {
  const {
    sentence,
    charGroups,
    addCharDiacritic,
    removeCharDiacritics,
    removeCharDiacritic,
    setSentence,
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
  const [aiJson, setAiJson] = useState<AIJsonSchema>();
  const [difficulty, setDifficulty] = useState<DifficultyType>(
    difficultyItems[0].value
  );

  const isInitialized = useRef(false);

  const isComplete = useMemo(() => {
    return sentence === aiJson?.diacritic;
  }, [sentence]);

  const hasDiacritic = useMemo(() => {
    return sentence !== aiJson?.plain;
  }, [sentence]);

  const onNextClick = useCallback(async (d: DifficultyType) => {
    console.log("difficulty:", d);
    try {
      setLoading(true);

      const completion = await generateSentence(d);
      const jsonResult: AIJsonSchema = JSON.parse(
        completion.choices[0].message.content as string
      );
      setAiJson(jsonResult);
      console.log(jsonResult);
      resetActions();
      setSentence(jsonResult.plain);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onAddDiacritic = (cIdx: number) => {
    console.log(selectedToggle);
    if (!selectedToggle) return;

    let codePointIdx = 0;

    for (let i = 0; i < cIdx; i++) {
      const charGroupWithoutZwj = removeZwj(charGroups[i]);
      codePointIdx += charGroupWithoutZwj.length;
    }

    const diacriticCodepoint = diacritics.find(
      (d) => d.name === selectedToggle
    )?.codePoint;

    addCharDiacritic(codePointIdx, diacriticCodepoint as number);
    addAction({ pos: codePointIdx, diacritic: diacriticCodepoint as number });
  };

  const onDifficultyChange = useCallback(
    (value: string) => {
      const newDifficulty = value as DifficultyType;
      setDifficulty(newDifficulty);
      onNextClick(newDifficulty);
    },
    [setDifficulty, onNextClick]
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
    <div className="flex flex-col h-screen bg-neutral-900">
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
                sentence={sentence}
                charGroups={charGroups}
                mapping={aiJson?.word_mapping ?? []}
                onCharSelect={onAddDiacritic}
              />

              <div className="flex items-center justify-center gap-x-5 mt-8">
                <Tooltip content={aiJson?.translation as string}>
                  <Button variant="ghost" size="icon">
                    <Languages className="h-4 w-4" />
                  </Button>
                </Tooltip>

                <Tooltip
                  content={
                    <HelpTooltipContent
                      sentence={aiJson?.diacritic as string}
                    />
                  }
                >
                  <Button variant="ghost" size="icon">
                    <CircleHelp className="h-4 w-4" />
                  </Button>
                </Tooltip>

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

        {!loading && sentence && hasDiacritic && !isComplete && (
          <div className="mt-6">
            <Button variant="link" size="sm" onClick={removeCharDiacritics}>
              <Trash className="h-4 w-4 me-1" /> Remove harakat
            </Button>
          </div>
        )}

        {isComplete && (
          <div className="mt-6">
            <Button
              className="bg-green-500 hover:bg-green-700"
              variant="secondary"
              size="sm"
              onClick={() => onNextClick(difficulty)}
            >
              Next sentence
            </Button>
          </div>
        )}
      </div>
      <div className="bg-blue-300 h-16">Row 3</div>
    </div>
  );
}

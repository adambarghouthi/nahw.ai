import { useMemo } from "react";

import { makeCharGroupsWithZwj, removeDiacritics } from "@/lib/shaping";

import Word from "./Word";
import classNames from "classnames";

interface SentenceProps {
  sentence: string | null | undefined;
  charGroups: string[];
  showDiacritics: boolean;
  mapping: {
    arabic: string;
    translation: string;
    index: number;
  }[];
  onCharSelect: (cIdx: number) => void;
}

export default function Sentence({
  sentence,
  charGroups,
  mapping,
  showDiacritics,
  onCharSelect,
}: SentenceProps) {
  if (!sentence || typeof sentence === "undefined") {
    return null;
  }

  const diacriticCharGroups = useMemo(
    () => makeCharGroupsWithZwj(sentence).filter((c) => c !== " "),
    [sentence]
  );

  const words = useMemo(() => {
    const charGroupsWithoutSpaces = charGroups.filter((c) => c !== " ");
    return mapping
      .sort((a, b) => a.index - b.index) // double-check order
      .map((m) => {
        const range = { start: -1, end: -1 };
        const arabicWord = removeDiacritics(m.arabic);

        if (m.index === 0) {
          range.start = 0;
          range.end = arabicWord.length;
        } else {
          range.start = mapping
            .slice(0, m.index)
            .reduce((acc, _) => acc + removeDiacritics(_.arabic).length, 0);
          range.end = range.start + arabicWord.length;
        }

        const wordCharGroups = (
          showDiacritics
            ? charGroupsWithoutSpaces.map((c) => removeDiacritics(c))
            : charGroupsWithoutSpaces
        ).slice(range.start, range.end);

        return (
          <div className="relative">
            <div className="relative z-10">
              <Word
                index={m.index}
                translation={m.translation}
                charGroups={wordCharGroups}
                range={range}
                onCharSelect={onCharSelect}
              />
            </div>

            {showDiacritics && (
              <div className="absolute top-0 left-0 text-green-500 z-0">
                <Word
                  index={m.index}
                  translation={m.translation}
                  charGroups={diacriticCharGroups.slice(range.start, range.end)}
                  range={range}
                  onCharSelect={() => {}}
                />
              </div>
            )}
          </div>
        );
      });
  }, [charGroups, mapping, showDiacritics, onCharSelect]);

  return (
    <div
      id="sentence"
      dir="rtl"
      className="flex flex-wrap justify-center relative gap-x-0.5 gap-y-4 text-white text-5xl"
    >
      {words}
    </div>
  );
}

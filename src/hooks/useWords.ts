import { useCallback, useState, useMemo } from "react";
import {
  addDiacritic,
  removeDiacritics,
  makeCharGroupsWithZwj,
  removeDiacritic,
} from "@/lib/shaping";

interface useWordsProps {
  sentence: string;
  charGroups: string[];
  mapping: {
    arabic: string;
    translation: string;
    index: number;
  }[];
}

const useWords = ({ sentence, charGroups, mapping }: useWordsProps) => {
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

        const wordCharGroups = charGroupsWithoutSpaces.slice(
          range.start,
          range.end
        );

        return {
          index: m.index,
          translation: m.translation,
          charGroups: wordCharGroups,
          diacriticCharGroups: diacriticCharGroups.slice(
            range.start,
            range.end
          ),
          range,
        };
      });
  }, [charGroups, mapping]);

  return {
    words,
  };
};

export default useWords;

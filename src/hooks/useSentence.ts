import { useCallback, useState, useMemo } from "react";
import {
  addDiacritic,
  removeDiacritics,
  makeCharGroupsWithZwj,
  removeDiacritic,
} from "@/lib/shaping";

const useSentence = (s: string) => {
  const [sentence, setSentence] = useState<string>(s);

  const charGroups = useMemo(() => makeCharGroupsWithZwj(sentence), [sentence]);

  // adds diacritic at position
  const addCharDiacritic = useCallback(
    (pos: number, diacritic: number) => {
      const newSentence = addDiacritic(sentence, pos, diacritic);
      console.log(sentence, newSentence);
      setSentence(newSentence);
    },
    [sentence, setSentence]
  );

  // removes diacritic at position
  const removeCharDiacritic = useCallback(
    (pos: number) => {
      const newSentence = removeDiacritic(sentence, pos);
      setSentence(newSentence);
    },
    [sentence, setSentence]
  );

  // removes all diacritics
  const removeCharDiacritics = useCallback(() => {
    const newSentence = removeDiacritics(sentence);
    setSentence(newSentence);
  }, [sentence, setSentence]);

  return {
    sentence,
    charGroups,
    addCharDiacritic,
    removeCharDiacritic,
    removeCharDiacritics,
    setSentence,
  };
};

export default useSentence;

import { useMemo } from "react";

import Character from "./Character";
import Tooltip from "./Tooltip";

interface SentenceProps {
  sentence: string | null | undefined;
  charGroups: string[];
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
  onCharSelect,
}: SentenceProps) {
  if (!sentence || typeof sentence === "undefined") {
    return null;
  }

  const words = useMemo(() => {
    const charGroupsWithoutSpaces = charGroups.filter((c) => c !== " ");
    return mapping
      .sort((a, b) => a.index - b.index) // double-check order
      .map((m) => {
        const range = { start: -1, end: -1 };
        if (m.index === 0) {
          range.start = 0;
          range.end = m.arabic.length;
        } else {
          range.start = mapping
            .slice(0, m.index)
            .reduce((acc, _) => acc + _.arabic.length, 0);
          range.end = range.start + m.arabic.length;
        }

        return (
          <Tooltip key={m.index} content={m.translation}>
            <p id="word" className="rounded-lg px-2 py-1.5 hover:bg-muted">
              {charGroupsWithoutSpaces
                .slice(range.start, range.end)
                .map((c, cIdx) => (
                  <Character
                    key={cIdx}
                    char={c}
                    onSelect={() =>
                      c !== " "
                        ? onCharSelect(
                            cIdx +
                              range.start +
                              m.index /* to account for spaces */
                          )
                        : null
                    }
                  />
                ))}
            </p>
          </Tooltip>
        );
      });
  }, [charGroups, mapping, onCharSelect]);

  return (
    <div
      id="sentence"
      dir="rtl"
      className="flex flex-wrap justify-center gap-x-0.5 gap-y-4 text-white text-5xl"
    >
      {words}
    </div>
  );
}

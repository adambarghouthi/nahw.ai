import { motion, AnimatePresence } from "framer-motion";

import { removeDiacritics } from "@/lib/shaping";

import Tooltip from "./Tooltip";
import Character from "./Character";

interface WordProps {
  index: number;
  translation: string;
  charGroups: string[];
  diacriticCharGroups: string[];
  showDiacritics: boolean;
  selectedChar?: number[];
  range: {
    start: number;
    end: number;
  };
  onCharSelect: (
    wIdx: number,
    cIdx: number,
    addIdx: number,
    coords: number[]
  ) => void;
}

export default function Word({
  index,
  translation,
  charGroups,
  diacriticCharGroups,
  range,
  showDiacritics,
  selectedChar,
  onCharSelect,
}: WordProps) {
  return (
    <Tooltip content={translation}>
      <div
        id="word"
        className="relative flex rounded-lg px-2 pt-3 pb-1.5 hover:bg-muted"
      >
        {charGroups.map((c, cIdx) => {
          return (
            <div key={cIdx} className="relative">
              <div className="relative z-10">
                <Character
                  key={cIdx + c}
                  char={showDiacritics ? removeDiacritics(c) : c}
                  selected={
                    index === selectedChar?.[0] && cIdx === selectedChar?.[1]
                  }
                  onSelect={(coords) => {
                    onCharSelect(index, cIdx, cIdx + range.start, coords);
                  }}
                />
              </div>

              <AnimatePresence>
                {showDiacritics && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    exit={{ opacity: 0 }}
                    className="absolute top-0 left-0 text-green-500"
                  >
                    <Character
                      key={cIdx + c}
                      char={diacriticCharGroups[cIdx]}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </Tooltip>
  );
}

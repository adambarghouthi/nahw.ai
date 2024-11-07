import Tooltip from "./Tooltip";
import Character from "./Character";

interface WordProps {
  index: number;
  translation: string;
  charGroups: string[];
  range: {
    start: number;
    end: number;
  };
  onCharSelect: (index: number) => void;
}

export default function Word({
  index,
  translation,
  charGroups,
  range,
  onCharSelect,
}: WordProps) {
  return (
    <Tooltip content={translation}>
      <p id="word" className="flex rounded-lg px-2 py-1.5 hover:bg-muted">
        {charGroups.map((c, cIdx) => {
          return (
            <Character
              key={cIdx + c}
              char={c}
              onSelect={() =>
                c !== " "
                  ? onCharSelect(
                      cIdx + range.start + index /* to account for spaces */
                    )
                  : null
              }
            />
          );
        })}
      </p>
    </Tooltip>
  );
}

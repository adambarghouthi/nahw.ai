import { cn } from "@/lib/utils";

interface CharacterProps {
  char: string | "";
  selected?: boolean;
  onSelect?: (coords: number[]) => void;
}
export default function Character({
  char,
  selected,
  onSelect,
}: CharacterProps) {
  return (
    <a
      className={cn(
        "cursor-pointer pt-2 pb-3 hover:text-green-500",
        selected && "text-green-500"
      )}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const coords = [rect.left, rect.top];
        onSelect?.(coords);
      }}
    >
      {char}
    </a>
  );
}

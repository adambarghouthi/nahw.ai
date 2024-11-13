interface CharacterProps {
  char: string | "";
  onSelect: (char: string) => void;
}
export default function Character({ char, onSelect }: CharacterProps) {
  return (
    <a
      className="cursor-pointer hover:text-green-500"
      onClick={() => onSelect(char)}
    >
      {char}
    </a>
  );
}

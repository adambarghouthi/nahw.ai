import { diacritics } from "@/lib/diacritics";

import { Toggle } from "./ui/toggle";
import * as DiacriticIcons from "./icons";

interface DiacriticsMenubarProps {
  selected: string | null;
  onSelect: (diacritic: string) => void;
}

export default function DiacriticsMenubar({
  selected,
  onSelect,
}: DiacriticsMenubarProps) {
  const renderToggleIcon = (name: string) => {
    switch (name) {
      case "fatha":
        return <DiacriticIcons.Fatha />;
      case "damma":
        return <DiacriticIcons.Damma />;
      case "kasra":
        return <DiacriticIcons.Kasra />;
      case "tanween al fatha":
        return <DiacriticIcons.TanFatha />;
      case "tanween al damma":
        return <DiacriticIcons.TanDamma />;
      case "tanween al kasra":
        return <DiacriticIcons.TanKasra />;
      case "sukoon":
        return <DiacriticIcons.Sukoon />;
      case "shadda":
        return <DiacriticIcons.Shadda />;
    }
  };

  return (
    <div className="flex flex-row items-center rounded-lg gap-x-1 border border-primary/15 p-1 shadow-lg">
      {diacritics.map((d) => (
        <Toggle
          key={d.name}
          className="size-10"
          pressed={selected === d.name}
          onPressedChange={() => onSelect(d.name)}
        >
          {renderToggleIcon(d.name)}
        </Toggle>
      ))}
    </div>
  );
}

import { diacritics } from "@/lib/diacritics";
import { Trash } from "lucide-react";
import { motion } from "framer-motion";

import * as DiacriticIcons from "./icons";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface DiacriticsMenubarProps {
  coords: number[];
  onSelect: (diacritic: string) => void;
}

export default function DiacriticsMenubar({
  coords,
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed flex flex-row items-center rounded-lg gap-x-1 bg-primary-foreground border border-primary/15 p-1 shadow-lg z-20 transition-[top,left] duration-300 ease-in-out"
      style={{
        left: coords[0] - 65,
        top: coords[1] + 70,
      }}
    >
      <div className="grid grid-cols-3 gap-1">
        {diacritics
          .slice(0, 3)
          .reverse()
          .map((d) => (
            <Button
              key={d.name}
              className="size-9"
              onClick={() => onSelect(d.name)}
              variant="ghost"
              size="icon"
            >
              {renderToggleIcon(d.name)}
            </Button>
          ))}
        {diacritics
          .slice(3, 6)
          .reverse()
          .map((d) => (
            <Button
              key={d.name}
              className="size-9"
              onClick={() => onSelect(d.name)}
              variant="ghost"
              size="icon"
            >
              {renderToggleIcon(d.name)}
            </Button>
          ))}
        {[null, ...diacritics.slice(6, 8).reverse()].map((d) =>
          d ? (
            <Button
              key={d.name}
              className="size-9"
              onClick={() => onSelect(d.name)}
              variant="ghost"
              size="icon"
            >
              {renderToggleIcon(d.name)}
            </Button>
          ) : (
            <Button
              key="trash"
              className="bg-red-800 bg-opacity-20 size-9 hover:bg-opacity-30 hover:bg-red-800"
              onClick={() => onSelect("trash")}
              variant="ghost"
              size="icon"
            >
              <Trash className="h-4 w-4 text-red-700" />
            </Button>
          )
        )}
        <div className="col-span-3">
          <Separator />
        </div>
        <div className="col-span-3">
          <Button
            size="sm"
            className="w-full"
            onClick={() => onSelect("close")}
            variant="ghost"
          >
            Close
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

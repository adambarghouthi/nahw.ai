import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface SelectProps {
  value: string;
  items: {
    value?: string;
    label: string;
  }[];
  onChange: (value: string) => void;
}

export default function Select({ value, onChange, items }: SelectProps) {
  return (
    <ShadcnSelect value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        {items.map((i) => (
          <SelectItem key={i.value} value={i.value ?? i.label}>
            {i.label}
          </SelectItem>
        ))}
      </SelectContent>
    </ShadcnSelect>
  );
}

interface HelpTooltipContentProps {
  sentence: string;
}

export default function HelpTooltipContent({
  sentence,
}: HelpTooltipContentProps) {
  return (
    <div>
      <p className="mb-2">The correct sentence with harakat is:</p>
      <div className="bg-muted rounded-md px-2 py-1.5">
        <p dir="rtl" className="font-bold text-lg text-right">
          {sentence}
        </p>
      </div>
    </div>
  );
}

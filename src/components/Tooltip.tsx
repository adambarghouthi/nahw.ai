import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  return (
    <ShadcnTooltip delayDuration={500}>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent className="max-w-xs">{content}</TooltipContent>
    </ShadcnTooltip>
  );
}

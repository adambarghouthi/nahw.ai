import { wordContextActions } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";

interface WordContextMenuProps {
  onClick: (action: string) => void;
  children: React.ReactNode;
}

export default function WordContextMenu({
  onClick,
  children,
}: WordContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onClick(wordContextActions.IRAB)}>
          ʾIʿrāb
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onClick(wordContextActions.DEFINITION)}>
          Definition
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

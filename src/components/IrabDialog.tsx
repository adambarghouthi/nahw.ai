import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Skeleton } from "./ui/skeleton";

interface IrabDialogProps {
  open: boolean;
  title: string;
  description: string;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function IrabDialog({
  open,
  title,
  description,
  loading,
  onOpenChange,
}: IrabDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent className="bg-primary-foreground rounded">
        <DialogHeader>
          <DialogTitle>
            {loading ? <Skeleton className="w-full h-[20px] rounded" /> : title}
          </DialogTitle>
          <DialogDescription className="text-md text-white pt-4">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="w-full h-[18px] rounded" />
                <Skeleton className="w-full h-[18px] rounded" />
                <Skeleton className="w-full h-[18px] rounded" />
              </div>
            ) : (
              description
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

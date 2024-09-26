import { LoaderCircle } from "lucide-react";

export default function Spinner() {
  return (
    <div className="rounded-lg border border-primary/15 p-3 shadow-lg">
      <LoaderCircle className="h-4 w-4 animate-spin" />
    </div>
  );
}

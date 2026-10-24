import type { EventStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<EventStatus, string> = {
  draft: "bg-amber-50 text-amber-700 ring-amber-200",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  archived: "bg-slate-100 text-slate-600 ring-slate-200",
};

const LABELS: Record<EventStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        STYLES[status],
      )}
    >
      {LABELS[status]}
    </span>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

interface SectionActionsProps {
  pending: boolean;
  error?: string | null;
  success?: string | null;
  onSave: () => void;
  saveLabel?: string;
  disabled?: boolean;
}

export function SectionActions({
  pending,
  error,
  success,
  onSave,
  saveLabel = "Save section",
  disabled = false,
}: SectionActionsProps) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <div className="min-h-5 text-sm" aria-live="polite">
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : success ? (
          <p className="text-emerald-600">{success}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onSave}
        disabled={pending || disabled}
        className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Saving..." : saveLabel}
      </button>
    </div>
  );
}

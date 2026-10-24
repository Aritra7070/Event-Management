"use client";

import { Check, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  checkSlugAction,
  updateEventAction,
} from "@/app/dashboard/events/actions";
import type { ActionResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SectionActions, SectionCard } from "./SectionCard";

interface SlugFieldProps {
  eventId: string;
  currentSlug: string;
  isPublished: boolean;
  onSave?: (patch: { slug: string }) => Promise<ActionResult<undefined>>;
}

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export function SlugField({
  eventId,
  currentSlug,
  isPublished,
  onSave,
}: SlugFieldProps) {
  const [slug, setSlug] = useState(currentSlug);
  const [savedSlug, setSavedSlug] = useState(currentSlug);
  const [status, setStatus] = useState<SlugStatus>("idle");
  const [reason, setReason] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const normalized = slug.trim();

    if (!normalized || normalized === savedSlug) {
      setStatus("idle");
      setReason(null);
      return;
    }

    setStatus("checking");
    setReason(null);
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const result = await checkSlugAction(normalized, eventId);
        if (cancelled) {
          return;
        }

        if (!result.success) {
          setStatus("invalid");
          setReason(result.message ?? "Could not check this slug.");
          return;
        }

        if (result.data.available) {
          setStatus("available");
          setReason(null);
          return;
        }

        const message = result.data.reason ?? "That slug is already in use.";
        setStatus(
          message === "That slug is already in use." ? "taken" : "invalid",
        );
        setReason(message);
      } catch {
        if (!cancelled) {
          setStatus("invalid");
          setReason("Could not check this slug. Try again.");
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slug, savedSlug, eventId]);

  async function save() {
    setError(null);
    setSuccess(null);
    const normalized = slug.trim();

    if (!normalized) {
      setError("Slug is required.");
      return;
    }

    if (status === "taken" || status === "invalid") {
      setError(reason ?? "Choose an available slug.");
      return;
    }

    setPending(true);
    try {
      const action = onSave ?? ((patch) => updateEventAction(eventId, patch));
      const result = await action({ slug: normalized });
      if (!result.success) {
        setError(result.message ?? result.error);
        return;
      }

      setSavedSlug(normalized);
      setStatus("idle");
      setSuccess(`Saved. Public URL: /e/${normalized}`);
    } catch {
      setError("Could not save the slug. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const canSave =
    slug.trim().length > 0 &&
    status !== "checking" &&
    status !== "taken" &&
    status !== "invalid";

  return (
    <SectionCard
      title="Public URL"
      description="The last part of the public link attendees will share."
    >
      {isPublished && slug !== savedSlug ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          This event is live. Changing the slug will break existing links —
          old URLs will stop working.
        </div>
      ) : null}

      <label
        htmlFor="event-slug"
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        Slug
      </label>
      <div className="flex items-center rounded-xl border border-slate-300 bg-white shadow-sm transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
        <span className="pl-3.5 text-sm text-slate-400">/e/</span>
        <input
          id="event-slug"
          type="text"
          value={slug}
          onChange={(event) =>
            setSlug(
              event.target.value.toLowerCase().replace(/\s+/g, "-"),
            )
          }
          maxLength={60}
          aria-label="Public event slug"
          aria-describedby="slug-status"
          className="min-w-0 flex-1 rounded-r-xl bg-transparent px-2 py-2.5 text-sm text-slate-900 outline-none"
          placeholder="my-event-2026"
        />
      </div>

      <div
        id="slug-status"
        className="mt-2 min-h-5 text-xs"
        aria-live="polite"
      >
        {status === "checking" ? (
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Checking availability...
          </span>
        ) : status === "available" ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-600">
            <Check className="h-3.5 w-3.5" />
            Available
          </span>
        ) : status === "taken" || status === "invalid" ? (
          <span className="inline-flex items-center gap-1.5 text-red-600">
            <X className="h-3.5 w-3.5" />
            {reason}
          </span>
        ) : slug === savedSlug ? (
          <span className="text-slate-400">
            Current public URL: /e/{savedSlug}
          </span>
        ) : (
          <span className="text-slate-400">
            Use lowercase letters, digits and hyphens.
          </span>
        )}
      </div>

      <p
        className={cn(
          "mt-1 text-xs leading-5 text-slate-500",
          isPublished ? "text-amber-700" : undefined,
        )}
      >
        Lowercase letters, numbers and hyphens; 3–60 characters. Reserved
        words like <code>admin</code> are not allowed.
      </p>

      <SectionActions
        pending={pending}
        error={error}
        success={success}
        onSave={save}
        saveLabel="Save URL"
        disabled={!canSave}
      />
    </SectionCard>
  );
}

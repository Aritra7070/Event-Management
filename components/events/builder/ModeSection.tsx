"use client";

import { useState } from "react";
import { updateEventAction } from "@/app/dashboard/events/actions";
import type { ActionResult, EventMode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SectionActions, SectionCard } from "./SectionCard";

interface ModeSectionProps {
  eventId: string;
  mode: EventMode;
  venue: string | null;
  onlineUrl: string | null;
  onSave?: (patch: {
    mode: EventMode;
    venue: string | null;
    onlineUrl: string | null;
  }) => Promise<ActionResult<undefined>>;
}

const MODES: { value: EventMode; label: string; hint: string }[] = [
  {
    value: "in_person",
    label: "In person",
    hint: "Attendees meet at a physical venue.",
  },
  {
    value: "online",
    label: "Online",
    hint: "Attendees join through a meeting link.",
  },
  {
    value: "hybrid",
    label: "Hybrid",
    hint: "Both a venue and a meeting link.",
  },
];

export function ModeSection({
  eventId,
  mode: initialMode,
  venue: initialVenue,
  onlineUrl: initialOnlineUrl,
  onSave,
}: ModeSectionProps) {
  const [mode, setMode] = useState<EventMode>(initialMode);
  const [venue, setVenue] = useState(initialVenue ?? "");
  const [onlineUrl, setOnlineUrl] = useState(initialOnlineUrl ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const needsVenue = mode === "in_person" || mode === "hybrid";
  const needsOnlineUrl = mode === "online" || mode === "hybrid";

  async function save() {
    setError(null);
    setSuccess(null);

    if (needsVenue && !venue.trim()) {
      setError("Venue is required for in-person and hybrid events.");
      return;
    }

    if (needsOnlineUrl) {
      if (!onlineUrl.trim()) {
        setError("An online link is required for online and hybrid events.");
        return;
      }

      try {
        new URL(onlineUrl.trim());
      } catch {
        setError("Enter a valid online link, including https://.");
        return;
      }
    }

    setPending(true);
    try {
      const action =
        onSave ??
        ((patch) => updateEventAction(eventId, patch));
      const result = await action({
        mode,
        venue: venue.trim() || null,
        onlineUrl: onlineUrl.trim() || null,
      });
      if (!result.success) {
        setError(result.message ?? result.error);
        return;
      }
      setSuccess("Saved");
    } catch {
      setError("Could not save the event mode. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <SectionCard
      title="Location"
      description="Choose how attendees join and where the event takes place."
    >
      <fieldset>
        <legend className="sr-only">Event mode</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {MODES.map((option) => (
            <label
              key={option.value}
              className={cn(
                "cursor-pointer rounded-xl border p-4 transition",
                mode === option.value
                  ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <span className="flex items-start gap-3">
                <input
                  type="radio"
                  name={`event-mode-${eventId}`}
                  value={option.value}
                  checked={mode === option.value}
                  onChange={() => setMode(option.value)}
                  className="mt-1 h-4 w-4 accent-indigo-600"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                    {option.hint}
                  </span>
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 space-y-4">
        {needsVenue ? (
          <div>
            <label
              htmlFor="event-venue"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Venue
            </label>
            <input
              id="event-venue"
              type="text"
              value={venue}
              onChange={(event) => setVenue(event.target.value)}
              maxLength={500}
              aria-label="Event venue"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              placeholder="e.g. Bengaluru Convention Centre, Hall 2"
            />
          </div>
        ) : null}

        {needsOnlineUrl ? (
          <div>
            <label
              htmlFor="event-online-url"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Online link
            </label>
            <input
              id="event-online-url"
              type="url"
              value={onlineUrl}
              onChange={(event) => setOnlineUrl(event.target.value)}
              aria-label="Online event link"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              placeholder="https://meet.example.com/event"
            />
          </div>
        ) : null}
      </div>

      <SectionActions
        pending={pending}
        error={error}
        success={success}
        onSave={save}
        saveLabel="Save location"
      />
    </SectionCard>
  );
}

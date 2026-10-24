"use client";

import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { useMemo, useState } from "react";
import { updateEventAction } from "@/app/dashboard/events/actions";
import type { ActionResult } from "@/lib/types";
import { SectionActions, SectionCard } from "./SectionCard";

interface DateTimeSectionProps {
  eventId: string;
  startsAt: Date | null;
  endsAt: Date | null;
  timezone: string;
  onSave?: (patch: {
    startsAt: Date | null;
    endsAt: Date | null;
    timezone: string;
  }) => Promise<ActionResult<undefined>>;
}

function toLocalInput(date: Date | null, timezone: string): string {
  if (!date) {
    return "";
  }

  try {
    return formatInTimeZone(date, timezone, "yyyy-MM-dd'T'HH:mm");
  } catch {
    return "";
  }
}

function getTimezoneOptions(current: string): string[] {
  const supported = (
    Intl as unknown as {
      supportedValuesOf?: (key: string) => string[];
    }
  ).supportedValuesOf?.("timeZone") ?? [];

  return Array.from(new Set(["UTC", current || "UTC", ...supported]))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export function DateTimeSection({
  eventId,
  startsAt: initialStartsAt,
  endsAt: initialEndsAt,
  timezone: initialTimezone,
  onSave,
}: DateTimeSectionProps) {
  const timezoneValue = initialTimezone || "UTC";
  const [timezone, setTimezone] = useState(timezoneValue);
  const [startsAt, setStartsAt] = useState(() =>
    toLocalInput(initialStartsAt, timezoneValue),
  );
  const [endsAt, setEndsAt] = useState(() =>
    toLocalInput(initialEndsAt, timezoneValue),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const timezones = useMemo(
    () => getTimezoneOptions(timezoneValue),
    [timezoneValue],
  );

  async function save() {
    setError(null);
    setSuccess(null);

    let nextStartsAt: Date | null = null;
    let nextEndsAt: Date | null = null;

    try {
      nextStartsAt = startsAt ? fromZonedTime(startsAt, timezone) : null;
      nextEndsAt = endsAt ? fromZonedTime(endsAt, timezone) : null;
    } catch {
      setError("Enter valid start and end times.");
      return;
    }

    if (
      (nextStartsAt && Number.isNaN(nextStartsAt.getTime())) ||
      (nextEndsAt && Number.isNaN(nextEndsAt.getTime()))
    ) {
      setError("Enter valid start and end times.");
      return;
    }

    if (
      nextStartsAt &&
      nextEndsAt &&
      nextEndsAt.getTime() <= nextStartsAt.getTime()
    ) {
      setError("End time must be after start time.");
      return;
    }

    setPending(true);
    try {
      const action =
        onSave ??
        ((patch) =>
          updateEventAction(eventId, {
            startsAt: patch.startsAt,
            endsAt: patch.endsAt,
            timezone: patch.timezone,
          }));
      const result = await action({
        startsAt: nextStartsAt,
        endsAt: nextEndsAt,
        timezone,
      });
      if (!result.success) {
        setError(result.message ?? result.error);
        return;
      }
      setSuccess("Saved");
    } catch {
      setError("Could not save the date and time. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <SectionCard
      title="Date & time"
      description="Times are stored in UTC and shown to attendees in the event timezone."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="event-starts-at"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Starts
          </label>
          <input
            id="event-starts-at"
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            aria-label="Event start date and time"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div>
          <label
            htmlFor="event-ends-at"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Ends
          </label>
          <input
            id="event-ends-at"
            type="datetime-local"
            value={endsAt}
            min={startsAt || undefined}
            onChange={(event) => setEndsAt(event.target.value)}
            aria-label="Event end date and time"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="event-timezone"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Timezone
        </label>
        <select
          id="event-timezone"
          value={timezone}
          onChange={(event) => setTimezone(event.target.value)}
          aria-label="Event timezone"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        >
          {timezones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-slate-500">
          Changing the timezone reinterprets the wall-clock times above in the
          selected zone.
        </p>
      </div>

      <SectionActions
        pending={pending}
        error={error}
        success={success}
        onSave={save}
        saveLabel="Save date & time"
      />
    </SectionCard>
  );
}

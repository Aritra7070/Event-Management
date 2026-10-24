"use client";

import * as Switch from "@radix-ui/react-switch";
import { useState } from "react";
import { updateEventAction } from "@/app/dashboard/events/actions";
import type { ActionResult } from "@/lib/types";
import { SectionActions, SectionCard } from "./SectionCard";

interface CapacitySectionProps {
  eventId: string;
  capacity: number | null;
  requiresApproval: boolean;
  waitlistEnabled: boolean;
  onSave?: (patch: {
    capacity: number | null;
    requiresApproval: boolean;
    waitlistEnabled: boolean;
  }) => Promise<ActionResult<undefined>>;
}

export function CapacitySection({
  eventId,
  capacity: initialCapacity,
  requiresApproval: initialRequiresApproval,
  waitlistEnabled: initialWaitlistEnabled,
  onSave,
}: CapacitySectionProps) {
  const [capacity, setCapacity] = useState(
    initialCapacity !== null ? String(initialCapacity) : "",
  );
  const [requiresApproval, setRequiresApproval] = useState(
    initialRequiresApproval,
  );
  const [waitlistEnabled, setWaitlistEnabled] = useState(initialWaitlistEnabled);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function save() {
    setError(null);
    setSuccess(null);

    let nextCapacity: number | null = null;
    if (capacity.trim()) {
      const parsed = Number(capacity);
      if (!Number.isInteger(parsed) || parsed < 1) {
        setError("Capacity must be a whole number of at least 1.");
        return;
      }
      nextCapacity = parsed;
    }

    setPending(true);
    try {
      const action =
        onSave ??
        ((patch) => updateEventAction(eventId, patch));
      const result = await action({
        capacity: nextCapacity,
        requiresApproval,
        waitlistEnabled,
      });
      if (!result.success) {
        setError(result.message ?? result.error);
        return;
      }
      setSuccess("Saved");
    } catch {
      setError("Could not save capacity settings. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <SectionCard
      title="Capacity & registration"
      description="Leave capacity empty for unlimited registrations."
    >
      <div>
        <label
          htmlFor="event-capacity"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Capacity
        </label>
        <input
          id="event-capacity"
          type="number"
          min={1}
          step={1}
          value={capacity}
          onChange={(event) => setCapacity(event.target.value)}
          aria-label="Event capacity"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          placeholder="Unlimited"
        />
        <p className="mt-1.5 text-xs text-slate-500">
          Capacity cannot be set below the number of confirmed registrations.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <label
              htmlFor="requires-approval"
              className="text-sm font-medium text-slate-800"
            >
              Require approval
            </label>
            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              Review each registration before confirming it.
            </p>
          </div>
          <Switch.Root
            id="requires-approval"
            checked={requiresApproval}
            onCheckedChange={setRequiresApproval}
            aria-label="Require registration approval"
            className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-slate-300 transition data-[state=checked]:bg-indigo-600"
          >
            <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition data-[state=checked]:translate-x-[22px]" />
          </Switch.Root>
        </div>

        <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <label
              htmlFor="waitlist-enabled"
              className="text-sm font-medium text-slate-800"
            >
              Enable waitlist
            </label>
            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              Let attendees join a waitlist when the event is full.
            </p>
          </div>
          <Switch.Root
            id="waitlist-enabled"
            checked={waitlistEnabled}
            onCheckedChange={setWaitlistEnabled}
            aria-label="Enable waitlist"
            className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-slate-300 transition data-[state=checked]:bg-indigo-600"
          >
            <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition data-[state=checked]:translate-x-[22px]" />
          </Switch.Root>
        </div>
      </div>

      <SectionActions
        pending={pending}
        error={error}
        success={success}
        onSave={save}
        saveLabel="Save capacity"
      />
    </SectionCard>
  );
}

"use client";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Lock,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { Event, ViewerState } from "@/lib/types";

interface RegisterPanelProps {
  event: Event;
  initialViewerState?: ViewerState;
  confirmedCount?: number;
}

type DisplayState =
  | ViewerState
  | "draft"
  | "archived"
  | "removed"
  | "unavailable";

function computeDisplayState(
  event: Event,
  confirmedCount: number,
): DisplayState {
  if (event.moderationStatus === "removed") {
    return "removed";
  }

  if (event.moderationStatus !== "ok") {
    return "unavailable";
  }

  if (event.status === "draft") {
    return "draft";
  }

  if (event.status === "archived") {
    return "archived";
  }

  const endsAt = event.endsAt ? new Date(event.endsAt).getTime() : null;
  if (endsAt !== null && !Number.isNaN(endsAt) && endsAt < Date.now()) {
    return "ended";
  }

  if (event.capacity !== null && confirmedCount >= event.capacity) {
    return "full";
  }

  return "register";
}

type Tone = "success" | "neutral" | "warning";

const TONE_STYLES: Record<Tone, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  neutral: "bg-slate-100 text-slate-600 ring-slate-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
};

interface StatusViewProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: Tone;
}

function StatusView({
  icon: Icon,
  title,
  description,
  tone = "neutral",
}: StatusViewProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ${TONE_STYLES[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </section>
  );
}

export function RegisterPanel({
  event,
  initialViewerState,
  confirmedCount = 0,
}: RegisterPanelProps) {
  const confirmed = Math.max(0, confirmedCount);
  const state = initialViewerState ?? computeDisplayState(event, confirmed);
  const registrationHref = `/e/${event.slug}/register`;
  const spotsLeft =
    event.capacity === null ? null : Math.max(0, event.capacity - confirmed);

  if (state === "registered") {
    return (
      <StatusView
        icon={CheckCircle2}
        tone="success"
        title="You're registered"
        description="We'll see you there. Your registration details are on their way."
      />
    );
  }

  if (state === "waitlisted") {
    return (
      <StatusView
        icon={Clock}
        title="You're on the waitlist"
        description="We'll email you if a spot opens up."
      />
    );
  }

  if (state === "ended") {
    return (
      <StatusView
        icon={CalendarDays}
        title="This event has ended"
        description="Registration is no longer available for this event."
      />
    );
  }

  if (state === "closed") {
    return (
      <StatusView
        icon={Lock}
        title="Registration is closed"
        description="The organizer is not accepting registrations right now."
      />
    );
  }

  if (state === "draft") {
    return (
      <StatusView
        icon={Lock}
        title="This event is a draft"
        description="Publish the event to open registration and make this page public."
      />
    );
  }

  if (state === "archived") {
    return (
      <StatusView
        icon={Lock}
        title="This event has been archived"
        description="Archived events are not open for registration."
      />
    );
  }

  if (state === "removed") {
    return (
      <StatusView
        icon={XCircle}
        title="This event is unavailable"
        description="This event was removed by a moderator."
      />
    );
  }

  if (state === "unavailable") {
    return (
      <StatusView
        icon={XCircle}
        title="Registration unavailable"
        description="This event is not currently available for registration."
      />
    );
  }

  if (state === "full") {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
            <Users className="h-5 w-5" />
          </div>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
            Full
          </span>
        </div>

        <h2 className="mt-4 text-base font-semibold text-slate-900">
          This event is full
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {event.waitlistEnabled
            ? "Join the waitlist and we'll let you know if a spot opens up."
            : "Registration is closed because the event has reached capacity."}
        </p>

        {event.waitlistEnabled ? (
          <Link
            href={registrationHref}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Join the waitlist
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
          <CalendarDays className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
          {event.requiresApproval ? "Approval required" : "Open"}
        </span>
      </div>

      <h2 className="mt-4 text-base font-semibold text-slate-900">
        Registration
      </h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">
        {event.requiresApproval
          ? "Send a request and the organizer will review it."
          : "Secure your spot for this event."}
      </p>

      <Link
        href={registrationHref}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        {event.requiresApproval ? "Request to register" : "Register"}
        <ArrowRight className="h-4 w-4" />
      </Link>

      <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
        {event.requiresApproval ? (
          <p>Organizer approval is required before your spot is confirmed.</p>
        ) : null}
        {spotsLeft !== null ? (
          <p>
            {spotsLeft === 0
              ? "No spots left"
              : `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`}
          </p>
        ) : null}
        {event.waitlistEnabled ? (
          <p>A waitlist is available if the event fills up.</p>
        ) : null}
      </div>
    </section>
  );
}

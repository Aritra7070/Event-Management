import { formatInTimeZone } from "date-fns-tz";
import { ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/events/StatusBadge";
import { requireRole } from "@/lib/auth-stubs";
import { listManageableEvents } from "@/lib/services/events";
import { getRegistrationCounts } from "@/lib/services/registrations-stub";
import type { Event, EventMode } from "@/lib/types";

export const dynamic = "force-dynamic";

const MODE_LABELS: Record<EventMode, string> = {
  in_person: "In person",
  online: "Online",
  hybrid: "Hybrid",
};

function formatWhen(event: Event): string {
  if (!event.startsAt) {
    return "Date TBD";
  }

  try {
    return formatInTimeZone(
      event.startsAt,
      event.timezone,
      "MMM d, yyyy · h:mm a zzz",
    );
  } catch {
    return "Date TBD";
  }
}

export default async function EventsDashboardPage() {
  const user = await requireRole(["organizer", "admin"]);
  const events = await listManageableEvents(user.id);
  const counts = await getRegistrationCounts(events.map((event) => event.id));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Organizer dashboard
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            Your events
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Draft, publish and manage events. Registration, check-in and
            analytics links will appear here as the other modules land.
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <Plus className="h-4 w-4" />
          Create event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            No events yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Start with a title. The builder saves everything else as you go, and
            nothing becomes public until you publish.
          </p>
          <Link
            href="/dashboard/events/new"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" />
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[minmax(0,1fr)_130px_150px_100px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
            <span>Event</span>
            <span>Status</span>
            <span>When</span>
            <span className="text-right">Manage</span>
          </div>

          <ul className="divide-y divide-slate-100">
            {events.map((event) => (
              <li
                key={event.id}
                className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_130px_150px_100px] sm:items-center sm:gap-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/events/${event.id}/edit`}
                    className="truncate text-sm font-semibold text-slate-900 hover:text-indigo-600"
                  >
                    {event.title}
                  </Link>
                  <p className="mt-1 truncate text-xs text-slate-400">
                    /e/{event.slug} · {MODE_LABELS[event.mode]} ·{" "}
                    {counts[event.id] ?? 0} registered
                  </p>
                </div>

                <div>
                  <StatusBadge status={event.status} />
                </div>

                <p className="text-xs text-slate-500">{formatWhen(event)}</p>

                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/dashboard/events/${event.id}/edit`}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  {event.status === "published" ? (
                    <Link
                      href={`/e/${event.slug}`}
                      aria-label={`Open public page for ${event.title}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

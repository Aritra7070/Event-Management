
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Search,
  ShieldAlert,
  Archive,
  CheckCircle2,
} from "lucide-react";

import {
  getAdminEventStats,
  getAdminEvents,
} from "@/lib/services/admin";
import { requireRole } from "@/lib/auth-stubs";

export const dynamic = "force-dynamic";

function formatDate(value: Date | string | null) {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusStyle(status: string) {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-700";
    case "archived":
      return "bg-slate-100 text-slate-700";
    case "draft":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function moderationStyle(status: string) {
  switch (status) {
    case "flagged":
      return "bg-red-100 text-red-700";
    case "removed":
      return "bg-slate-200 text-slate-700";
    case "ok":
      return "bg-green-100 text-green-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default async function AdminEventsPage() {
  await requireRole("admin");

  let events: Awaited<ReturnType<typeof getAdminEvents>> = [];
  let stats = {
    totalEvents: 0,
    publishedEvents: 0,
    flaggedEvents: 0,
  };
  let databaseError = false;

  try {
    const [eventStats, eventRecords] = await Promise.all([
      getAdminEventStats(),
      getAdminEvents(100),
    ]);

    stats = eventStats;
    events = eventRecords;
  } catch (error) {
    databaseError = true;
    console.error("Failed to load Admin Events page:", error);
  }

  const statCards = [
    {
      label: "Total events",
      value: stats.totalEvents,
      note: "All events in the database",
      icon: CalendarDays,
    },
    {
      label: "Published events",
      value: stats.publishedEvents,
      note: "Events visible to attendees",
      icon: CheckCircle2,
    },
    {
      label: "Flagged events",
      value: stats.flaggedEvents,
      note: "Awaiting moderation",
      icon: ShieldAlert,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 sm:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-indigo-600">
              Administration
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Manage Events
            </h1>
            <p className="mt-2 text-slate-600">
              Review and monitor platform events.
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Moderation actions not connected
          </div>
        </div>

        {databaseError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            Unable to load event data. Check the server terminal for the
            database error and verify your Neon connection.
          </div>
        )}

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <Icon size={21} className="text-indigo-600" />
                </div>

                <p className="mt-5 text-3xl font-bold">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-400">{stat.note}</p>
              </div>
            );
          })}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
            <div>
              <h2 className="font-semibold">All events</h2>
              <p className="mt-1 text-sm text-slate-500">
                Event directory and moderation status
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-400">
              <Search size={17} />
              Search events (coming soon)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Event</th>
                  <th className="px-5 py-4">Organizer ID</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Moderation</th>
                  <th className="px-5 py-4">Starts</th>
                  <th className="px-5 py-4">Created</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {event.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {event.slug}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-slate-600">
                      {event.ownerId}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(event.status)}`}
                      >
                        {event.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${moderationStyle(event.moderationStatus)}`}
                      >
                        {event.moderationStatus}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDate(event.startsAt)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDate(event.createdAt)}
                    </td>
                  </tr>
                ))}

                {!databaseError && events.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                        <Archive size={25} className="text-indigo-600" />
                      </div>

                      <p className="font-medium text-slate-800">
                        No events found
                      </p>

                      <p className="mx-auto mt-2 max-w-lg text-slate-500">
                        Your database is connected, but there are no event
                        records to display yet.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
            Showing {events.length} event
            {events.length === 1 ? "" : "s"} (maximum 100)
          </div>
        </section>
      </div>
    </main>
  );
}


import Link from "next/link";
import {
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { getFlaggedAdminEvents } from "@/lib/services/admin";

export const dynamic = "force-dynamic";

function formatDate(date: Date | string | null) {
  if (!date) return "Not scheduled";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminModerationPage() {
  let flaggedEvents: Awaited<
    ReturnType<typeof getFlaggedAdminEvents>
  > = [];

  let databaseError = false;

  try {
    flaggedEvents = await getFlaggedAdminEvents(50);
  } catch (error) {
    console.error("Failed to load moderation queue:", error);
    databaseError = true;
  }

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
              Event Moderation
            </h1>
            <p className="mt-2 text-slate-600">
              Review events flagged for moderation.
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Read-only mode
          </div>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <Clock size={21} className="text-amber-600" />
            <p className="mt-4 text-sm text-slate-500">
              Pending review
            </p>
            <p className="mt-3 text-3xl font-bold">
              {databaseError ? "—" : flaggedEvents.length}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Flagged events in the latest 50 records
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <CheckCircle2 size={21} className="text-emerald-600" />
            <p className="mt-4 text-sm text-slate-500">
              Restored events
            </p>
            <p className="mt-3 text-3xl font-bold">—</p>
            <p className="mt-2 text-sm text-slate-400">
              Restoration history is not available yet
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <XCircle size={21} className="text-rose-600" />
            <p className="mt-4 text-sm text-slate-500">
              Removed events
            </p>
            <p className="mt-3 text-3xl font-bold">—</p>
            <p className="mt-2 text-sm text-slate-400">
              Removal history is not available yet
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold">Flagged events queue</h2>
            <p className="mt-1 text-sm text-slate-500">
              Events marked as flagged in the database.
            </p>
          </div>

          {databaseError ? (
            <div className="px-5 py-16 text-center">
              <ShieldAlert
                size={30}
                className="mx-auto mb-4 text-rose-500"
              />
              <p className="font-medium text-slate-800">
                Could not load moderation data
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Check the development terminal for the database error.
              </p>
            </div>
          ) : flaggedEvents.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <ShieldAlert
                size={30}
                className="mx-auto mb-4 text-amber-500"
              />
              <p className="font-medium text-slate-800">
                No flagged events found
              </p>
              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
                The database currently has no flagged events in the
                records retrieved. New flagged events will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Event</th>
                    <th className="px-5 py-4 font-medium">Event status</th>
                    <th className="px-5 py-4 font-medium">Flag status</th>
                    <th className="px-5 py-4 font-medium">Created</th>
                    <th className="px-5 py-4 font-medium">Starts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {flaggedEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">
                          {event.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {event.slug}
                        </p>
                      </td>
                      <td className="px-5 py-4 capitalize">
                        {event.status}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                          {event.moderationStatus}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {formatDate(event.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {formatDate(event.startsAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-4 text-sm text-slate-500">
          Moderation changes are disabled until proper admin
          authorization is implemented.
        </p>
      </div>
    </main>
  );
}


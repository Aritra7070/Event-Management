
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Search,
  ShieldAlert,
  Archive,
  CheckCircle2,
} from "lucide-react";

const stats = [
  {
    label: "Total events",
    value: "—",
    note: "Waiting for event data",
    icon: CalendarDays,
  },
  {
    label: "Published events",
    value: "—",
    note: "Events visible to attendees",
    icon: CheckCircle2,
  },
  {
    label: "Flagged events",
    value: "—",
    note: "Awaiting moderation",
    icon: ShieldAlert,
  },
];

export default function AdminEventsPage() {
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
              Review, moderate and manage platform events.
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Moderation actions not connected
          </div>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => {
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
                  <th className="px-5 py-4">Organizer</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Moderation</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                      <Archive size={25} className="text-indigo-600" />
                    </div>
                    <p className="font-medium text-slate-800">
                      No event data connected
                    </p>
                    <p className="mx-auto mt-2 max-w-lg text-slate-500">
                      Event records, status filters and moderation controls
                      will appear when the event services are connected.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

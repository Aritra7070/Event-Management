
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  UserRoundCheck,
  CalendarDays,
  ShieldCheck,
  Mail,
} from "lucide-react";

export default function AdminOrganizersPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-5 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-indigo-600">Administration</p>
            <h1 className="mt-1 text-3xl font-bold">Manage Organizers</h1>
            <p className="mt-2 text-sm text-slate-500">
              Review organizer accounts and their event activity.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            <ShieldCheck size={17} />
            Approval actions not connected
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Total organizers</p>
              <UserRoundCheck size={20} className="text-indigo-600" />
            </div>
            <p className="mt-3 text-3xl font-bold">—</p>
            <p className="mt-2 text-xs text-slate-400">
              Awaiting user database
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Events created</p>
              <CalendarDays size={20} className="text-emerald-600" />
            </div>
            <p className="mt-3 text-3xl font-bold">—</p>
            <p className="mt-2 text-xs text-slate-400">
              Awaiting organizer event counts
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Pending reviews</p>
              <ShieldCheck size={20} className="text-amber-600" />
            </div>
            <p className="mt-3 text-3xl font-bold">—</p>
            <p className="mt-2 text-xs text-slate-400">
              Approval workflow to be confirmed
            </p>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">All organizers</h2>
              <p className="mt-1 text-sm text-slate-500">
                Organizer directory and event activity
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <Search size={17} className="text-slate-400" />
              <input
                type="search"
                placeholder="Search organizers..."
                aria-label="Search organizers"
                className="w-full bg-transparent text-sm outline-none sm:w-56"
                disabled
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Organizer</th>
                  <th className="px-5 py-4 font-semibold">Events</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Mail size={22} />
                    </div>
                    <p className="mt-4 font-medium text-slate-700">
                      No organizer data connected
                    </p>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Organizer records, event counts and approval controls
                      will appear after the shared user schema and services
                      are available.
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

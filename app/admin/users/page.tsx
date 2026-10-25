
import Link from "next/link";
import { ArrowLeft, Search, Users, UserPlus } from "lucide-react";

export default function AdminUsersPage() {
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
            <h1 className="mt-1 text-3xl font-bold">Manage Users</h1>
            <p className="mt-2 text-sm text-slate-500">
              Search accounts and review user roles and statuses.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            <Users size={17} />
            Database connection pending
          </div>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total users</p>
            <p className="mt-3 text-3xl font-bold">—</p>
            <p className="mt-2 text-xs text-slate-400">
              Awaiting real user data
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Active accounts</p>
            <p className="mt-3 text-3xl font-bold">—</p>
            <p className="mt-2 text-xs text-slate-400">
              Awaiting account statuses
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Suspended accounts</p>
            <p className="mt-3 text-3xl font-bold">—</p>
            <p className="mt-2 text-xs text-slate-400">
              Awaiting account statuses
            </p>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">All users</h2>
              <p className="mt-1 text-sm text-slate-500">
                Account management and role review
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <Search size={17} className="text-slate-400" />
              <input
                type="search"
                placeholder="Search users..."
                aria-label="Search users"
                className="w-full bg-transparent text-sm outline-none sm:w-52"
                disabled
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">User</th>
                  <th className="px-5 py-4 font-semibold">Role</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <UserPlus size={23} />
                    </div>
                    <p className="mt-4 font-medium text-slate-700">
                      User data will appear here
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      The team&apos;s user schema and authentication services
                      must be connected before account management is enabled.
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

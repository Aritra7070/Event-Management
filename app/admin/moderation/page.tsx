
import Link from "next/link";
import {
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export default function AdminModerationPage() {
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
              Review flagged events and manage moderation decisions.
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Moderation actions not connected
          </div>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <Clock size={21} className="text-amber-600" />
            <p className="mt-4 text-sm text-slate-500">Pending review</p>
            <p className="mt-3 text-3xl font-bold">—</p>
            <p className="mt-2 text-sm text-slate-400">Awaiting moderation data</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <CheckCircle2 size={21} className="text-emerald-600" />
            <p className="mt-4 text-sm text-slate-500">Restored events</p>
            <p className="mt-3 text-3xl font-bold">—</p>
            <p className="mt-2 text-sm text-slate-400">Awaiting audit records</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <XCircle size={21} className="text-rose-600" />
            <p className="mt-4 text-sm text-slate-500">Removed events</p>
            <p className="mt-3 text-3xl font-bold">—</p>
            <p className="mt-2 text-sm text-slate-400">Awaiting audit records</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold">Flagged events queue</h2>
            <p className="mt-1 text-sm text-slate-500">
              Review reports before taking moderation action.
            </p>
          </div>

          <div className="px-5 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
              <ShieldAlert size={25} className="text-amber-600" />
            </div>
            <p className="font-medium text-slate-800">
              No moderation data connected
            </p>
            <p className="mx-auto mt-2 max-w-lg text-slate-500">
              Flagged events, report reasons, and restore or remove controls
              will appear after the moderation service is connected.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

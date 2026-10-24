import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NewEventForm } from "@/components/events/builder/NewEventForm";
import { requireRole } from "@/lib/auth-stubs";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  await requireRole(["organizer", "admin"]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/dashboard/events"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          New event
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Start with a title
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          We&apos;ll create a private draft and open the page builder. Nothing
          is public until you publish.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <NewEventForm />
      </div>
    </main>
  );
}

import { ArrowLeft, ExternalLink, Eye } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccentColorPicker } from "@/components/events/builder/AccentColorPicker";
import { BasicsSection } from "@/components/events/builder/BasicsSection";
import { CapacitySection } from "@/components/events/builder/CapacitySection";
import { DateTimeSection } from "@/components/events/builder/DateTimeSection";
import { EventLifecycleActions } from "@/components/events/builder/EventLifecycleActions";
import { HostsSection } from "@/components/events/builder/HostsSection";
import { ImageUpload } from "@/components/events/builder/ImageUpload";
import { ModeSection } from "@/components/events/builder/ModeSection";
import { QuestionEditor } from "@/components/events/builder/QuestionEditor";
import { SlugField } from "@/components/events/builder/SlugField";
import { StatusBadge } from "@/components/events/StatusBadge";
import { requireRole } from "@/lib/auth-stubs";
import {
  canManageEvent,
  getEventById,
  getQuestions,
} from "@/lib/services/events";
import { getEventHosts } from "@/lib/services/hosts";

export const dynamic = "force-dynamic";

interface EditEventPageProps {
  params: { id: string };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const user = await requireRole(["organizer", "admin"]);
  const event = await getEventById(params.id);

  if (!event || !(await canManageEvent(user.id, event.id))) {
    notFound();
  }

  const [questions, hosts] = await Promise.all([
    getQuestions(event.id),
    getEventHosts(event.id),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard/events"
              aria-label="Back to events"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-semibold text-slate-900">
                  {event.title}
                </h1>
                <StatusBadge status={event.status} />
              </div>
              <p className="truncate text-xs text-slate-400">
                /e/{event.slug}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {event.status === "published" ? (
              <Link
                href={`/e/${event.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <ExternalLink className="h-4 w-4" />
                View live
              </Link>
            ) : null}
            <Link
              href={`/dashboard/events/${event.id}/preview`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Link>
            <EventLifecycleActions eventId={event.id} status={event.status} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {event.status === "published" ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
            <strong className="font-semibold">This event is live.</strong>{" "}
            Changes are visible on the public page immediately. Changing the
            slug breaks existing links.
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <BasicsSection
              eventId={event.id}
              title={event.title}
              descriptionMd={event.descriptionMd}
            />

            <DateTimeSection
              eventId={event.id}
              startsAt={event.startsAt}
              endsAt={event.endsAt}
              timezone={event.timezone}
            />

            <ModeSection
              eventId={event.id}
              mode={event.mode}
              venue={event.venue}
              onlineUrl={event.onlineUrl}
            />

            <CapacitySection
              eventId={event.id}
              capacity={event.capacity}
              requiresApproval={event.requiresApproval}
              waitlistEnabled={event.waitlistEnabled}
            />

            <QuestionEditor
              eventId={event.id}
              questions={questions}
            />
          </div>

          <aside className="space-y-6">
            <SlugField
              eventId={event.id}
              currentSlug={event.slug}
              isPublished={event.status === "published"}
            />

            <ImageUpload
              eventId={event.id}
              currentUrl={event.coverUrl}
              field="cover"
            />

            <ImageUpload
              eventId={event.id}
              currentUrl={event.logoUrl}
              field="logo"
            />

            <AccentColorPicker
              eventId={event.id}
              currentColor={event.accentColor}
            />

            <HostsSection eventId={event.id} hosts={hosts} />
          </aside>
        </div>
      </main>
    </div>
  );
}

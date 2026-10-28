import {
  CalendarDays,
  ExternalLink,
  MapPin,
  Users,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { MarkdownRenderer } from "@/components/events/MarkdownRenderer";
import { RegisterPanel } from "@/components/events/RegisterPanel";
import { StatusBadge } from "@/components/events/StatusBadge";
import { TrackView } from "@/components/events/TrackView";
import {
  EVENT_MODE_LABELS,
  formatEventDateRange,
  formatEventLocation,
  getInitials,
} from "@/lib/event-display";
import type {
  Event,
  EventHostWithEmail,
  EventMode,
  Question,
  ViewerState,
} from "@/lib/types";

interface EventPageProps {
  event: Event;
  questions: Question[];
  hosts: EventHostWithEmail[];
  ownerEmail: string | null;
  confirmedCount?: number;
  initialViewerState?: ViewerState;
  mode: "preview" | "public";
}

function ModeBadge({ mode }: { mode: EventMode }) {
  const Icon = mode === "online" ? Video : mode === "hybrid" ? Users : MapPin;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
      <Icon className="h-3.5 w-3.5" />
      {EVENT_MODE_LABELS[mode]}
    </span>
  );
}

function HostItem({ email, role }: { email: string | null; role: string }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
        {getInitials(email)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-800">
          {email ?? "Organizer"}
        </p>
        <p className="text-xs text-slate-400">{role}</p>
      </div>
    </li>
  );
}

export function EventPage({
  event,
  questions,
  hosts,
  ownerEmail,
  confirmedCount,
  initialViewerState,
  mode,
}: EventPageProps) {
  const accent = event.accentColor ?? "#4f46e5";
  const accentStyle = { "--accent": accent } as CSSProperties;
  const hasDescription = event.descriptionMd.trim().length > 0;
  const showOnlineLink =
    Boolean(event.onlineUrl) &&
    (event.mode === "online" || event.mode === "hybrid");
  const hostEntries = [
    { email: ownerEmail, role: "Host" },
    ...hosts
      .filter((host) => host.email && host.email !== ownerEmail)
      .map((host) => ({ email: host.email, role: "Co-host" })),
  ];

  return (
    <div
      style={accentStyle}
      className="min-h-screen bg-slate-50 text-slate-900"
    >
      {mode === "preview" ? (
        <div className="sticky top-0 z-30 border-b border-amber-200 bg-amber-50/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold text-amber-900">
              Preview mode — this page is not public
            </p>
            <Link
              href={`/dashboard/events/${event.id}/edit`}
              className="text-sm font-semibold text-amber-900 underline-offset-4 hover:underline"
            >
              Back to editor
            </Link>
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />

          <div className="relative aspect-[2/1] w-full overflow-hidden bg-slate-100 sm:aspect-[16/7]">
            {event.coverUrl ? (
              <Image
                src={event.coverUrl}
                alt={`${event.title} cover`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${accent} 0%, #0f172a 100%)`,
                }}
              >
                <span className="text-6xl font-bold text-white/90">
                  {event.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

            {event.logoUrl ? (
              <div className="absolute bottom-4 left-4 h-16 w-16 overflow-hidden rounded-2xl border border-white/20 bg-white p-2 shadow-lg">
                <div className="relative h-full w-full">
                  <Image
                    src={event.logoUrl}
                    alt={`${event.title} logo`}
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="p-5 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <ModeBadge mode={event.mode} />
                  {mode === "preview" ? (
                    <StatusBadge status={event.status} />
                  ) : null}
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  {event.title}
                </h1>

                <div className="mt-6 space-y-2.5 text-sm text-slate-600">
                  <p className="flex items-start gap-2.5">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>
                      {formatEventDateRange(
                        event.startsAt,
                        event.endsAt,
                        event.timezone,
                      )}
                    </span>
                  </p>
                  <p className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>{formatEventLocation(event)}</span>
                  </p>
                  {showOnlineLink ? (
                    <a
                      href={event.onlineUrl ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-slate-700 underline-offset-4 hover:text-slate-950 hover:underline"
                    >
                      <Video className="h-4 w-4 text-slate-400" />
                      Join online
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>

                <section className="mt-8 border-t border-slate-100 pt-8">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    About this event
                  </h2>
                  {hasDescription ? (
                    <MarkdownRenderer
                      content={event.descriptionMd}
                      className="mt-3"
                    />
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      Details for this event are coming soon.
                    </p>
                  )}
                </section>

                {mode === "preview" && questions.length > 0 ? (
                  <section className="mt-8 border-t border-slate-100 pt-8">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Registration questions
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Attendees will answer these on the registration page.
                    </p>
                    <ul className="mt-4 space-y-2">
                      {questions.map((question) => (
                        <li
                          key={question.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                        >
                          <span className="text-slate-700">
                            {question.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            {question.required ? "Required" : "Optional"} ·{" "}
                            {question.type}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <section className="mt-8 border-t border-slate-100 pt-8">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Hosts
                  </h2>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {hostEntries.map((host, index) => (
                      <HostItem
                        key={`${host.email ?? "owner"}-${index}`}
                        email={host.email}
                        role={host.role}
                      />
                    ))}
                  </ul>
                </section>
              </div>

              <aside
                className={
                  mode === "preview"
                    ? "lg:sticky lg:top-24 lg:self-start"
                    : "lg:sticky lg:top-6 lg:self-start"
                }
              >
                <RegisterPanel
                  event={event}
                  initialViewerState={initialViewerState}
                  confirmedCount={confirmedCount}
                />
              </aside>
            </div>
          </div>
        </article>
      </main>

      {mode === "public" ? <TrackView eventId={event.id} /> : null}
    </div>
  );
}

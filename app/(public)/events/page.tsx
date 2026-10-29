import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EventCard } from "@/components/events/EventCard";
import {
  CALENDAR_PAGE_SIZE,
  calendarHref,
  getCalendarTotalPages,
  parseCalendarQuery,
} from "@/lib/calendar";
import { listPublishedEvents } from "@/lib/services/events";
import { getBaseUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const EVENTS_URL = `${getBaseUrl()}/events`;

const TAB_LINKS = [
  { value: "upcoming" as const, label: "Upcoming" },
  { value: "past" as const, label: "Past" },
];

export const metadata: Metadata = {
  title: "Events",
  description: "Browse upcoming and past events on EventSphere.",
  alternates: { canonical: EVENTS_URL },
  openGraph: {
    type: "website",
    title: "Events | EventSphere",
    description: "Browse upcoming and past events on EventSphere.",
    url: EVENTS_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Events | EventSphere",
    description: "Browse upcoming and past events on EventSphere.",
  },
};

interface PublicEventsPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function PublicEventsPage({
  searchParams,
}: PublicEventsPageProps) {
  const { tab, page } = parseCalendarQuery(searchParams);

  const { items, total } = await listPublishedEvents({
    tab,
    page,
    pageSize: CALENDAR_PAGE_SIZE,
  });

  const totalPages = getCalendarTotalPages(total, CALENDAR_PAGE_SIZE);

  if (page > totalPages) {
    redirect(calendarHref(tab, totalPages));
  }

  const firstItem = total === 0 ? 0 : (page - 1) * CALENDAR_PAGE_SIZE + 1;
  const lastItem = Math.min(page * CALENDAR_PAGE_SIZE, total);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            EventSphere calendar
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Events
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Discover what&apos;s happening next, or look back at events you
            missed. Every listing links to the full event page.
          </p>
        </div>

        <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm">
          {total === 0
            ? "No events yet"
            : `${firstItem}–${lastItem} of ${total} events`}
        </p>
      </div>

      <nav
        aria-label="Event timeframe"
        className="mt-8 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
      >
        {TAB_LINKS.map(({ value, label }) => (
          <Link
            key={value}
            href={calendarHref(value)}
            aria-current={tab === value ? "page" : undefined}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition",
              tab === value
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            {tab === "upcoming"
              ? "No upcoming events yet"
              : "No past events yet"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {tab === "upcoming"
              ? "Check back soon — organizers are preparing new events."
              : "Once an event wraps up, it will appear here."}
          </p>
          {tab === "past" ? (
            <Link
              href={calendarHref("upcoming")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Browse upcoming events
            </Link>
          ) : null}
        </div>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((event) => (
            <li key={event.id} className="min-w-0">
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav
          aria-label="Calendar pagination"
          className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6"
        >
          {page > 1 ? (
            <Link
              href={calendarHref(tab, page - 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm font-medium text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </span>
          )}

          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>

          {page < totalPages ? (
            <Link
              href={calendarHref(tab, page + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm font-medium text-slate-300"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </nav>
      ) : null}
    </main>
  );
}

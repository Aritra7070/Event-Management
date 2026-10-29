import { ArrowRight, CalendarDays, MapPin, Users, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  EVENT_MODE_LABELS,
  formatEventDateRange,
  formatEventLocation,
} from "@/lib/event-display";
import type { EventCard as EventCardData, EventMode } from "@/lib/types";

function ModeIcon({ mode }: { mode: EventMode }) {
  if (mode === "online") {
    return <Video className="h-3.5 w-3.5" />;
  }

  if (mode === "hybrid") {
    return <Users className="h-3.5 w-3.5" />;
  }

  return <MapPin className="h-3.5 w-3.5" />;
}

export function EventCard({ event }: { event: EventCardData }) {
  return (
    <Link
      href={`/e/${event.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        {event.coverUrl ? (
          <Image
            src={event.coverUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-violet-600 to-slate-900">
            <span className="text-4xl font-bold text-white/80">
              {event.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
          <ModeIcon mode={event.mode} />
          {EVENT_MODE_LABELS[event.mode]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-xs font-medium text-indigo-600">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          {formatEventDateRange(
            event.startsAt,
            event.endsAt,
            event.timezone,
          )}
        </p>

        <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900 transition group-hover:text-indigo-700">
          {event.title}
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
          {formatEventLocation(event)}
        </p>

        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-slate-900">
          View event
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

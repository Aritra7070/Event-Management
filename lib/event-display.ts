import { formatInTimeZone } from "date-fns-tz";
import type { Event, EventMode } from "@/lib/types";

const FALLBACK_TIMEZONE = "UTC";

export const EVENT_MODE_LABELS: Record<EventMode, string> = {
  in_person: "In person",
  online: "Online",
  hybrid: "In person + online",
};

/** Remove the most common Markdown syntax for plain-text metadata. */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/^\s*[-+*]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function plainTextDescription(markdown: string, maxLength = 160): string {
  const text = stripMarkdown(markdown);

  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function safeTimezone(timezone: string): string {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(0);
    return timezone;
  } catch {
    return FALLBACK_TIMEZONE;
  }
}

export function formatEventDateRange(
  startsAt: Date | null,
  endsAt: Date | null,
  timezone: string,
): string {
  const start = startsAt ? new Date(startsAt) : null;
  const end = endsAt ? new Date(endsAt) : null;

  if (!start || Number.isNaN(start.getTime())) {
    return "Date to be announced";
  }

  const timeZone = safeTimezone(timezone);

  try {
    if (!end || Number.isNaN(end.getTime())) {
      return formatInTimeZone(start, timeZone, "EEE, MMM d, yyyy · h:mm a zzz");
    }

    const startDay = formatInTimeZone(start, timeZone, "yyyy-MM-dd");
    const endDay = formatInTimeZone(end, timeZone, "yyyy-MM-dd");

    if (startDay === endDay) {
      return `${formatInTimeZone(
        start,
        timeZone,
        "EEE, MMM d, yyyy · h:mm a",
      )} – ${formatInTimeZone(end, timeZone, "h:mm a zzz")}`;
    }

    return `${formatInTimeZone(
      start,
      timeZone,
      "EEE, MMM d, yyyy · h:mm a zzz",
    )} – ${formatInTimeZone(
      end,
      timeZone,
      "EEE, MMM d, yyyy · h:mm a zzz",
    )}`;
  } catch {
    return formatInTimeZone(
      start,
      FALLBACK_TIMEZONE,
      "EEE, MMM d, yyyy · h:mm a zzz",
    );
  }
}

export function formatEventLocation(
  event: Pick<Event, "mode" | "venue" | "onlineUrl">,
): string {
  const venue = event.venue?.trim();

  switch (event.mode) {
    case "online":
      return "Online";
    case "hybrid":
      return venue ? `${venue} + online` : "In person + online";
    default:
      return venue || "Venue to be announced";
  }
}

export function getInitials(value: string | null | undefined): string {
  if (!value) {
    return "?";
  }

  const localPart = value.includes("@") ? value.split("@")[0] : value;
  const parts = localPart.split(/[.\-_\s]+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || localPart.charAt(0).toUpperCase() || "?";
}

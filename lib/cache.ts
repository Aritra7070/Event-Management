import { revalidateTag } from "next/cache";

/**
 * Cache tags used by the public event page and calendar.
 *
 * `revalidateTag` may only be called from server actions or route handlers.
 * Keep these helpers out of `lib/services` so seed scripts and tests can call
 * services without a Next.js request context.
 */
export const CACHE_TAGS = {
  event: (id: string) => `event:${id}`,
  eventsList: "events-list",
  calendar: "calendar",
  dashboard: "dashboard-events",
} as const;

export function revalidateEvent(id: string) {
  revalidateTag(CACHE_TAGS.event(id));
  revalidateTag(CACHE_TAGS.eventsList);
  revalidateTag(CACHE_TAGS.calendar);
  revalidateTag(CACHE_TAGS.dashboard);
}

export function revalidateCalendar() {
  revalidateTag(CACHE_TAGS.calendar);
  revalidateTag(CACHE_TAGS.eventsList);
}

export function revalidateDashboard() {
  revalidateTag(CACHE_TAGS.dashboard);
}

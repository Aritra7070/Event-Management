import { cache } from "react";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache";
import { getUserEmail } from "@/lib/auth-stubs";
import { getEventBySlug, getQuestions } from "@/lib/services/events";
import { getEventHosts } from "@/lib/services/hosts";
import type { Event, EventHostWithEmail, Question } from "@/lib/types";

export function isPublicEvent(event: Event): boolean {
  return event.status === "published" && event.moderationStatus === "ok";
}

/**
 * Questions and hosts change less often than the event row. Caching this
 * related data keeps the public page light without risking stale publish
 * state or draft leakage. `revalidateEvent()` clears the events list tag,
 * which is shared by this cache entry.
 */
const getCachedEventRelated = unstable_cache(
  async (eventId: string) => {
    const [questions, hosts] = await Promise.all([
      getQuestions(eventId),
      getEventHosts(eventId),
    ]);

    return { questions, hosts };
  },
  ["public-event-related"],
  {
    tags: [CACHE_TAGS.eventsList],
    revalidate: 300,
  },
);

export interface PublicEventData {
  event: Event;
  questions: Question[];
  hosts: EventHostWithEmail[];
  ownerEmail: string | null;
}

/**
 * Public event loader.
 *
 * The event row itself is deliberately uncached: it is one indexed lookup and
 * must always be current for status/moderation checks. `React.cache` dedupes
 * the lookup between `generateMetadata()` and the page render.
 */
export const getPublicEventData = cache(
  async (slug: string): Promise<PublicEventData | null> => {
    const event = await getEventBySlug(slug);

    if (!event || !isPublicEvent(event)) {
      return null;
    }

    const [related, ownerEmail] = await Promise.all([
      getCachedEventRelated(event.id),
      getUserEmail(event.ownerId),
    ]);

    return {
      event,
      ...related,
      ownerEmail,
    };
  },
);

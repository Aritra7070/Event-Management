import { and, eq } from "drizzle-orm";

import { getUserRole } from "@/lib/auth-stubs";
import { getDb } from "@/lib/db";
import { eventHosts, events } from "@/lib/db/schema";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Checks whether a user is allowed to check attendees into an event.
 * This helper does not authenticate the user; the API must do that separately.
 */
export async function canCheckInForEvent(
  staffUserId: string,
  eventId: string,
): Promise<boolean> {
  if (!UUID_RE.test(staffUserId) || !UUID_RE.test(eventId)) {
    return false;
  }

  const [event] = await getDb()
    .select({ ownerId: events.ownerId })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  if (!event) {
    return false;
  }

  if (event.ownerId === staffUserId) {
    return true;
  }

  if ((await getUserRole(staffUserId)) === "admin") {
    return true;
  }

  const [host] = await getDb()
    .select({ userId: eventHosts.userId })
    .from(eventHosts)
    .where(
      and(
        eq(eventHosts.eventId, eventId),
        eq(eventHosts.userId, staffUserId),
        eq(eventHosts.canScan, true),
      ),
    )
    .limit(1);

  return Boolean(host);
}
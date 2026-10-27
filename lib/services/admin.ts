
import { count, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { events } from "@/lib/db/schema";

/**
 * Admin service
 *
 * Read-only event queries for the Admin Panel.
 * Proper authentication and authorization must be
 * enforced before exposing admin data to users.
 */

/**
 * Fetch event statistics for the admin dashboard.
 */
export async function getAdminEventStats() {
  const database = getDb();

  const [totalResult, publishedResult, flaggedResult] =
    await Promise.all([
      database
        .select({ value: count() })
        .from(events),

      database
        .select({ value: count() })
        .from(events)
        .where(eq(events.status, "published")),

      database
        .select({ value: count() })
        .from(events)
        .where(eq(events.moderationStatus, "flagged")),
    ]);

  return {
    totalEvents: totalResult[0]?.value ?? 0,
    publishedEvents: publishedResult[0]?.value ?? 0,
    flaggedEvents: flaggedResult[0]?.value ?? 0,
  };
}

/**
 * Fetch recent events for the admin events page.
 */
export async function getAdminEvents(limit = 20) {
  const safeLimit = Math.min(
    Math.max(Math.floor(limit), 1),
    100
  );

  return getDb()
    .select({
      id: events.id,
      title: events.title,
      slug: events.slug,
      ownerId: events.ownerId,
      status: events.status,
      moderationStatus: events.moderationStatus,
      createdAt: events.createdAt,
      startsAt: events.startsAt,
    })
    .from(events)
    .orderBy(desc(events.createdAt))
    .limit(safeLimit);
}

/**
 * Fetch only events that have been flagged for moderation.
 * This function reads data and does not modify the database.
 */
export async function getFlaggedAdminEvents(limit = 50) {
  const safeLimit = Math.min(
    Math.max(Math.floor(limit), 1),
    100
  );

  return getDb()
    .select({
      id: events.id,
      title: events.title,
      slug: events.slug,
      ownerId: events.ownerId,
      status: events.status,
      moderationStatus: events.moderationStatus,
      createdAt: events.createdAt,
      startsAt: events.startsAt,
    })
    .from(events)
    .where(eq(events.moderationStatus, "flagged"))
    .orderBy(desc(events.createdAt))
    .limit(safeLimit);
}

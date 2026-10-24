import { randomUUID } from "node:crypto";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  lt,
  or,
  sql,
} from "drizzle-orm";
import { getStubUserEmail, getUserRole } from "@/lib/auth-stubs";
import { getDb } from "@/lib/db";
import { eventHosts, events, questions } from "@/lib/db/schema";
import type {
  CalendarTab,
  DraftInput,
  Event,
  EventCard,
  EventInput,
  Question,
  Result,
  User,
} from "@/lib/types";
import {
  draftSchema,
  eventPatchSchema,
  publishSchema,
  slugSchema,
} from "@/lib/validators/events";
import { getConfirmedCount } from "./registrations-stub";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EVENT_WRITABLE_FIELDS = [
  "title",
  "descriptionMd",
  "coverUrl",
  "logoUrl",
  "accentColor",
  "startsAt",
  "endsAt",
  "timezone",
  "mode",
  "venue",
  "onlineUrl",
  "capacity",
  "requiresApproval",
  "waitlistEnabled",
  "slug",
] as const;

export type EventWriteError =
  | "invalid"
  | "forbidden"
  | "not_found"
  | "slug_taken"
  | "capacity_too_low"
  | "not_draft"
  | "has_registrations"
  | "removed";

export type PublishError = "invalid" | "forbidden" | "not_found" | "removed";

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function firstIssue(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Invalid input";
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

function ownerEmailFor(ownerId: string): string | null {
  return getStubUserEmail(ownerId);
}

// ---------------------------------------------------------------------------
// Reads — the P0 contract other members depend on
// ---------------------------------------------------------------------------

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const [row] = await getDb()
    .select()
    .from(events)
    .where(sql`lower(${events.slug}) = lower(${slug})`)
    .limit(1);

  return (row as Event | undefined) ?? null;
}

export async function getEventById(id: string): Promise<Event | null> {
  if (!isUuid(id)) {
    return null;
  }

  const [row] = await getDb()
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);

  return (row as Event | undefined) ?? null;
}

export async function canManageEvent(
  userId: string,
  eventId: string,
): Promise<boolean> {
  if (!userId || !isUuid(userId) || !isUuid(eventId)) {
    return false;
  }

  const event = await getEventById(eventId);
  if (!event) {
    return false;
  }

  if (event.ownerId === userId) {
    return true;
  }

  if ((await getUserRole(userId)) === "admin") {
    return true;
  }

  const [host] = await getDb()
    .select({ eventId: eventHosts.eventId })
    .from(eventHosts)
    .where(
      and(eq(eventHosts.eventId, eventId), eq(eventHosts.userId, userId)),
    )
    .limit(1);

  return Boolean(host);
}

export async function listPublishedEvents(opts: {
  tab: CalendarTab;
  page: number;
  pageSize: number;
}): Promise<{ items: EventCard[]; total: number }> {
  const tab: CalendarTab = opts.tab === "past" ? "past" : "upcoming";
  const page = Math.max(1, Math.trunc(opts.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Math.trunc(opts.pageSize) || 12));
  const now = new Date();

  const timeFilter =
    tab === "upcoming" ? gte(events.endsAt, now) : lt(events.endsAt, now);

  const where = and(
    eq(events.status, "published"),
    eq(events.moderationStatus, "ok"),
    isNotNull(events.endsAt),
    timeFilter,
  );

  const db = getDb();
  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(events)
      .where(where)
      .orderBy(tab === "upcoming" ? asc(events.startsAt) : desc(events.startsAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(events).where(where),
  ]);

  const items: EventCard[] = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    coverUrl: row.coverUrl,
    startsAt: row.startsAt as Date,
    endsAt: row.endsAt as Date,
    timezone: row.timezone,
    mode: row.mode,
    venue: row.venue,
    onlineUrl: row.onlineUrl,
    ownerEmail: ownerEmailFor(row.ownerId),
  }));

  return { items, total: Number(totalRows[0]?.value ?? 0) };
}

export async function getQuestions(eventId: string): Promise<Question[]> {
  if (!isUuid(eventId)) {
    return [];
  }

  const rows = await getDb()
    .select()
    .from(questions)
    .where(eq(questions.eventId, eventId))
    .orderBy(asc(questions.position));

  return rows as Question[];
}

// ---------------------------------------------------------------------------
// Organizer reads
// ---------------------------------------------------------------------------

export async function listEventsByOwner(ownerId: string): Promise<Event[]> {
  if (!isUuid(ownerId)) {
    return [];
  }

  const rows = await getDb()
    .select()
    .from(events)
    .where(eq(events.ownerId, ownerId))
    .orderBy(desc(events.updatedAt));

  return rows as Event[];
}

/**
 * Every event the user can open in the builder: owned, co-hosted, or all
 * events for an admin. The dashboard should use this, not listEventsByOwner.
 */
export async function listManageableEvents(userId: string): Promise<Event[]> {
  if (!userId || !isUuid(userId)) {
    return [];
  }

  const db = getDb();

  if ((await getUserRole(userId)) === "admin") {
    const rows = await db.select().from(events).orderBy(desc(events.updatedAt));
    return rows as Event[];
  }

  const hosted = await db
    .select({ eventId: eventHosts.eventId })
    .from(eventHosts)
    .where(eq(eventHosts.userId, userId));

  const conditions = [eq(events.ownerId, userId)];
  if (hosted.length > 0) {
    conditions.push(inArray(events.id, hosted.map((row) => row.eventId)));
  }

  const rows = await db
    .select()
    .from(events)
    .where(or(...conditions))
    .orderBy(desc(events.updatedAt));

  return rows as Event[];
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export async function createDraft(
  ownerId: string,
  input: DraftInput,
): Promise<Result<Event, EventWriteError>> {
  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid",
      message: firstIssue(parsed.error),
    };
  }

  let slug = `draft-${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (await isSlugAvailable(slug)) {
      break;
    }
    slug = `draft-${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }

  try {
    const [row] = await getDb()
      .insert(events)
      .values({
        ownerId,
        title: parsed.data.title,
        slug,
        status: "draft",
        moderationStatus: "ok",
        timezone: "UTC",
        mode: "in_person",
      })
      .returning();

    return { ok: true, data: row as Event };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, error: "slug_taken" };
    }
    throw error;
  }
}

export async function updateEvent(
  actor: User,
  id: string,
  input: EventInput,
): Promise<Result<Event, EventWriteError>> {
  const event = await getEventById(id);
  if (!event) {
    return { ok: false, error: "not_found" };
  }

  if (!(await canManageEvent(actor.id, id))) {
    return { ok: false, error: "forbidden" };
  }

  if (event.moderationStatus === "removed") {
    return {
      ok: false,
      error: "forbidden",
      message: "Removed events cannot be edited.",
    };
  }

  const parsed = eventPatchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid",
      message: firstIssue(parsed.error),
    };
  }

  const patch = parsed.data;

  const nextStartsAt =
    patch.startsAt !== undefined ? patch.startsAt : event.startsAt;
  const nextEndsAt = patch.endsAt !== undefined ? patch.endsAt : event.endsAt;

  if (
    nextStartsAt &&
    nextEndsAt &&
    nextEndsAt.getTime() <= nextStartsAt.getTime()
  ) {
    return {
      ok: false,
      error: "invalid",
      message: "End time must be after start time.",
    };
  }

  if (patch.capacity !== undefined && patch.capacity !== null) {
    const confirmed = await getConfirmedCount(id);
    if (patch.capacity < confirmed) {
      return {
        ok: false,
        error: "capacity_too_low",
        message: `Capacity cannot be lower than the ${confirmed} confirmed registrations.`,
      };
    }
  }

  if (patch.slug && patch.slug !== event.slug) {
    if (!(await isSlugAvailable(patch.slug, id))) {
      return {
        ok: false,
        error: "slug_taken",
        message: "That slug is already in use.",
      };
    }
  }

  const set: Partial<typeof events.$inferInsert> = { updatedAt: new Date() };
  for (const key of EVENT_WRITABLE_FIELDS) {
    const value = patch[key];
    if (value !== undefined) {
      (set as Record<string, unknown>)[key] = value;
    }
  }

  try {
    const [row] = await getDb()
      .update(events)
      .set(set)
      .where(eq(events.id, id))
      .returning();

    return { ok: true, data: row as Event };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        ok: false,
        error: "slug_taken",
        message: "That slug is already in use.",
      };
    }
    throw error;
  }
}

export async function isSlugAvailable(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  if (!slugSchema.safeParse(slug).success) {
    return false;
  }

  const rows = await getDb()
    .select({ id: events.id })
    .from(events)
    .where(sql`lower(${events.slug}) = lower(${slug})`)
    .limit(2);

  return rows.every((row) => row.id === excludeId);
}

export async function publishEvent(
  actor: User,
  id: string,
): Promise<Result<Event, PublishError>> {
  const event = await getEventById(id);
  if (!event) {
    return { ok: false, error: "not_found" };
  }

  if (!(await canManageEvent(actor.id, id))) {
    return { ok: false, error: "forbidden" };
  }

  if (event.moderationStatus === "removed") {
    return {
      ok: false,
      error: "removed",
      message: "This event was removed by a moderator and cannot be published.",
    };
  }

  if (event.status === "archived") {
    return {
      ok: false,
      error: "forbidden",
      message: "Restore this archived event to draft before publishing.",
    };
  }

  const parsed = publishSchema.safeParse(event);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid",
      message: firstIssue(parsed.error),
    };
  }

  if (event.capacity !== null) {
    const confirmed = await getConfirmedCount(id);
    if (event.capacity < confirmed) {
      return {
        ok: false,
        error: "invalid",
        message: "Capacity is below the confirmed registration count.",
      };
    }
  }

  const [row] = await getDb()
    .update(events)
    .set({ status: "published", updatedAt: new Date() })
    .where(eq(events.id, id))
    .returning();

  return { ok: true, data: row as Event };
}

export async function unpublishEvent(
  actor: User,
  id: string,
): Promise<Result<Event, EventWriteError>> {
  const event = await getEventById(id);
  if (!event) {
    return { ok: false, error: "not_found" };
  }

  if (!(await canManageEvent(actor.id, id))) {
    return { ok: false, error: "forbidden" };
  }

  if (event.status === "archived" && actor.role !== "admin") {
    return {
      ok: false,
      error: "forbidden",
      message: "Only an admin can restore an archived event.",
    };
  }

  if (event.status === "draft") {
    return { ok: true, data: event };
  }

  const [row] = await getDb()
    .update(events)
    .set({ status: "draft", updatedAt: new Date() })
    .where(eq(events.id, id))
    .returning();

  return { ok: true, data: row as Event };
}

export async function archiveEvent(
  actor: User,
  id: string,
): Promise<Result<Event, EventWriteError>> {
  const event = await getEventById(id);
  if (!event) {
    return { ok: false, error: "not_found" };
  }

  if (!(await canManageEvent(actor.id, id))) {
    return { ok: false, error: "forbidden" };
  }

  if (event.moderationStatus === "removed" && actor.role !== "admin") {
    return { ok: false, error: "forbidden" };
  }

  if (event.status === "archived") {
    return { ok: true, data: event };
  }

  const [row] = await getDb()
    .update(events)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(events.id, id))
    .returning();

  return { ok: true, data: row as Event };
}

export async function deleteEvent(
  actor: User,
  id: string,
): Promise<Result<void, EventWriteError>> {
  const event = await getEventById(id);
  if (!event) {
    return { ok: false, error: "not_found" };
  }

  if (!(await canManageEvent(actor.id, id))) {
    return { ok: false, error: "forbidden" };
  }

  if (event.status !== "draft") {
    return {
      ok: false,
      error: "not_draft",
      message: "Only drafts can be deleted. Archive published events instead.",
    };
  }

  const confirmed = await getConfirmedCount(id);
  if (confirmed > 0) {
    return {
      ok: false,
      error: "has_registrations",
      message: "This draft has registrations and must be archived, not deleted.",
    };
  }

  await getDb().delete(events).where(eq(events.id, id));

  return { ok: true, data: undefined };
}

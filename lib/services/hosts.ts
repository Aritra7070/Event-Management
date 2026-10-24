import { and, eq } from "drizzle-orm";
import { findUserByEmail, getUserEmail } from "@/lib/auth-stubs";
import { getDb } from "@/lib/db";
import { eventHosts } from "@/lib/db/schema";
import type {
  EventHostWithEmail,
  Result,
  User,
} from "@/lib/types";
import { canManageEvent, getEventById } from "./events";

export type HostWriteError = "forbidden" | "not_found" | "exists";

export async function getEventHosts(
  eventId: string,
): Promise<EventHostWithEmail[]> {
  const rows = await getDb()
    .select()
    .from(eventHosts)
    .where(eq(eventHosts.eventId, eventId));

  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      email: await getUserEmail(row.userId),
    })),
  );
}

export async function addHost(
  actor: User,
  eventId: string,
  email: string,
  canScan: boolean,
): Promise<Result<void, HostWriteError>> {
  if (!(await canManageEvent(actor.id, eventId))) {
    return { ok: false, error: "forbidden" };
  }

  const event = await getEventById(eventId);
  if (!event) {
    return { ok: false, error: "not_found" };
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return {
      ok: false,
      error: "not_found",
      message: "No signed-up user has that email address yet.",
    };
  }

  if (user.id === event.ownerId) {
    return {
      ok: false,
      error: "exists",
      message: "The event owner is already a host.",
    };
  }

  const [existing] = await getDb()
    .select({ eventId: eventHosts.eventId })
    .from(eventHosts)
    .where(
      and(eq(eventHosts.eventId, eventId), eq(eventHosts.userId, user.id)),
    )
    .limit(1);

  if (existing) {
    return { ok: false, error: "exists" };
  }

  await getDb().insert(eventHosts).values({
    eventId,
    userId: user.id,
    canScan,
  });

  return { ok: true, data: undefined };
}

export async function removeHost(
  actor: User,
  eventId: string,
  userId: string,
): Promise<Result<void, HostWriteError>> {
  if (!(await canManageEvent(actor.id, eventId))) {
    return { ok: false, error: "forbidden" };
  }

  const event = await getEventById(eventId);
  if (!event) {
    return { ok: false, error: "not_found" };
  }

  if (event.ownerId === userId) {
    return {
      ok: false,
      error: "forbidden",
      message: "The event owner cannot be removed as a host.",
    };
  }

  await getDb()
    .delete(eventHosts)
    .where(
      and(eq(eventHosts.eventId, eventId), eq(eventHosts.userId, userId)),
    );

  return { ok: true, data: undefined };
}

export async function updateHostCanScan(
  actor: User,
  eventId: string,
  userId: string,
  canScan: boolean,
): Promise<Result<void, HostWriteError>> {
  if (!(await canManageEvent(actor.id, eventId))) {
    return { ok: false, error: "forbidden" };
  }

  const rows = await getDb()
    .update(eventHosts)
    .set({ canScan })
    .where(
      and(eq(eventHosts.eventId, eventId), eq(eventHosts.userId, userId)),
    )
    .returning({ eventId: eventHosts.eventId });

  if (rows.length === 0) {
    return { ok: false, error: "not_found" };
  }

  return { ok: true, data: undefined };
}

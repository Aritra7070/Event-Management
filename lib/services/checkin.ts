import { and, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { attendance, registrations } from "@/lib/db/schema";
import { verifyTicketToken } from "@/lib/qr/token";
import { canCheckInForEvent } from "@/lib/services/checkin-permissions";
import type { Result } from "@/lib/types";

type CheckInError =
  | "invalid_token"
  | "invalid_input"
  | "not_found"
  | "not_confirmed"
  | "forbidden"
  | "already_checked_in"
  | "internal_error";

type CheckInRecord = {
  registrationId: string;
  eventId: string;
  checkedInAt: Date;
  method: "qr" | "manual";
};

function success(
  record: CheckInRecord,
): Result<CheckInRecord, CheckInError> {
  return { ok: true, data: record };
}

function failure(
  error: CheckInError,
): Result<CheckInRecord, CheckInError> {
  return { ok: false, error };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function recordCheckIn(
  registrationId: string,
  eventId: string,
  staffUserId: string,
  method: "qr" | "manual",
): Promise<Result<CheckInRecord, CheckInError>> {
  const db = getDb();

  const [inserted] = await db
    .insert(attendance)
    .values({
      registrationId,
      eventId,
      checkedInBy: staffUserId,
      method,
    })
    .onConflictDoNothing({
      target: attendance.registrationId,
    })
    .returning({
      registrationId: attendance.registrationId,
      eventId: attendance.eventId,
      checkedInAt: attendance.checkedInAt,
      method: attendance.method,
    });

  if (!inserted) {
    return failure("already_checked_in");
  }

  return success({
    registrationId: inserted.registrationId,
    eventId: inserted.eventId,
    checkedInAt: inserted.checkedInAt,
    method: inserted.method,
  });
}

export async function checkInByToken(
  token: string,
  eventId: string,
  staffUserId: string,
): Promise<Result<CheckInRecord, CheckInError>> {
  if (
    typeof token !== "string" ||
    !UUID_RE.test(eventId) ||
    !UUID_RE.test(staffUserId)
  ) {
    return failure("invalid_input");
  }

  let ticketId: string | null;

  try {
    // Verify the signature before making any database query.
    ticketId = verifyTicketToken(token);
  } catch {
    return failure("internal_error");
  }

  if (!ticketId) {
    return failure("invalid_token");
  }

  try {
    // Check staff permissions before looking up the registration.
    const allowed = await canCheckInForEvent(staffUserId, eventId);

    if (!allowed) {
      return failure("forbidden");
    }

    const [registration] = await getDb()
      .select({
        id: registrations.id,
        eventId: registrations.eventId,
        status: registrations.status,
      })
      .from(registrations)
      .where(
        and(
          eq(registrations.qrToken, token),
          eq(registrations.eventId, eventId),
        ),
      )
      .limit(1);

    if (!registration) {
      return failure("not_found");
    }

    if (registration.status !== "confirmed") {
      return failure("not_confirmed");
    }

    return await recordCheckIn(
      registration.id,
      registration.eventId,
      staffUserId,
      "qr",
    );
  } catch {
    return failure("internal_error");
  }
}

export async function checkInManually(
  registrationId: string,
  staffUserId: string,
): Promise<Result<CheckInRecord, CheckInError>> {
  if (!UUID_RE.test(registrationId) || !UUID_RE.test(staffUserId)) {
    return failure("invalid_input");
  }

  try {
    const [registration] = await getDb()
      .select({
        id: registrations.id,
        eventId: registrations.eventId,
        status: registrations.status,
      })
      .from(registrations)
      .where(eq(registrations.id, registrationId))
      .limit(1);

    if (!registration) {
      return failure("not_found");
    }

    const allowed = await canCheckInForEvent(
      staffUserId,
      registration.eventId,
    );

    if (!allowed) {
      return failure("forbidden");
    }

    if (registration.status !== "confirmed") {
      return failure("not_confirmed");
    }

    return await recordCheckIn(
      registration.id,
      registration.eventId,
      staffUserId,
      "manual",
    );
  } catch {
    return failure("internal_error");
  }
}
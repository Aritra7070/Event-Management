import type { ViewerState } from "@/lib/types";

/**
 * Member 1's registration service does not exist yet. Every capacity/full/
 * viewer-state decision in the Events module goes through these three
 * functions so the real implementation is a one-file swap.
 *
 * TODO(Member 1): replace with counts from the `registrations` table and
 * viewer state computed for the signed-in user.
 */

export async function getConfirmedCount(_eventId: string): Promise<number> {
  return 0;
}

export async function getRegistrationCounts(
  eventIds: readonly string[],
): Promise<Record<string, number>> {
  return Object.fromEntries(eventIds.map((eventId) => [eventId, 0]));
}

export async function getViewerState(
  _userId: string | null,
  _eventId: string,
): Promise<ViewerState | null> {
  return null;
}

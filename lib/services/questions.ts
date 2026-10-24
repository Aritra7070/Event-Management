import { eq } from "drizzle-orm";
import { getDbPool } from "@/lib/db/pool";
import { questions } from "@/lib/db/schema";
import type { Question, QuestionInput, Result, User } from "@/lib/types";
import { questionsArraySchema } from "@/lib/validators/events";
import { canManageEvent, getQuestions } from "./events";
import { getConfirmedCount } from "./registrations-stub";

export type QuestionWriteError =
  | "forbidden"
  | "invalid"
  | "registrations_exist";

function firstIssue(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Invalid questions";
}

/**
 * Replaces the event's question list in one transaction.
 *
 * Questions are deleted and re-inserted with positions taken from the array
 * order. When registrations already exist, destructive edits (removing a
 * question or changing its type) are blocked so stored answers stay readable
 * (TRD §8.4).
 */
export async function saveQuestions(
  actor: User,
  eventId: string,
  input: QuestionInput[],
): Promise<Result<Question[], QuestionWriteError>> {
  if (!(await canManageEvent(actor.id, eventId))) {
    return { ok: false, error: "forbidden" };
  }

  const parsed = questionsArraySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid",
      message: firstIssue(parsed.error),
    };
  }

  const confirmed = await getConfirmedCount(eventId);
  if (confirmed > 0) {
    const existing = await getQuestions(eventId);
    const incomingById = new Map(
      parsed.data
        .filter((question) => question.id)
        .map((question) => [question.id as string, question]),
    );

    for (const question of existing) {
      const incoming = incomingById.get(question.id);
      if (!incoming || incoming.type !== question.type) {
        return {
          ok: false,
          error: "registrations_exist",
          message:
            "Questions cannot be removed or have their type changed after registrations exist. Hide the question instead.",
        };
      }
    }
  }

  const db = getDbPool();

  await db.transaction(async (tx) => {
    await tx.delete(questions).where(eq(questions.eventId, eventId));

    if (parsed.data.length > 0) {
      await tx.insert(questions).values(
        parsed.data.map((question, index) => ({
          ...(question.id ? { id: question.id } : {}),
          eventId,
          label: question.label,
          type: question.type,
          options: question.type === "select" ? question.options ?? null : null,
          required: question.required,
          position: index,
        })),
      );
    }
  });

  return { ok: true, data: await getQuestions(eventId) };
}

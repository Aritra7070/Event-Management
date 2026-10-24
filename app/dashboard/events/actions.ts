"use server";

import { z } from "zod";
import { revalidateCalendar, revalidateDashboard, revalidateEvent } from "@/lib/cache";
import { requireRole } from "@/lib/auth-stubs";
import {
  archiveEvent,
  createDraft,
  deleteEvent,
  isSlugAvailable,
  publishEvent,
  unpublishEvent,
  updateEvent,
} from "@/lib/services/events";
import {
  addHost,
  removeHost,
  updateHostCanScan,
} from "@/lib/services/hosts";
import { saveQuestions } from "@/lib/services/questions";
import type {
  ActionResult,
  EventInput,
  Question,
  QuestionInput,
  User,
} from "@/lib/types";
import { slugSchema } from "@/lib/validators/events";

async function getActor(): Promise<User | null> {
  try {
    return await requireRole(["organizer", "admin"]);
  } catch {
    return null;
  }
}

const forbidden = {
  success: false as const,
  error: "forbidden",
  message: "Sign in as an organizer to manage events.",
};

const emailSchema = z.string().trim().email("Enter a valid email address");
const uuidSchema = z.string().uuid("Invalid user id");

// ---------------------------------------------------------------------------
// Event CRUD + lifecycle
// ---------------------------------------------------------------------------

export async function createDraftAction(input: {
  title: string;
}): Promise<ActionResult<{ id: string }>> {
  const actor = await getActor();
  if (!actor) {
    return forbidden;
  }

  const result = await createDraft(actor.id, input);
  if (!result.ok) {
    return { success: false, error: result.error, message: result.message };
  }

  revalidateDashboard();
  return { success: true, data: { id: result.data.id } };
}

export async function updateEventAction(
  id: string,
  input: EventInput,
): Promise<ActionResult<undefined>> {
  const actor = await getActor();
  if (!actor) {
    return forbidden;
  }

  const result = await updateEvent(actor, id, input);
  if (!result.ok) {
    return { success: false, error: result.error, message: result.message };
  }

  revalidateEvent(id);
  revalidateDashboard();
  return { success: true, data: undefined };
}

export async function checkSlugAction(
  slug: string,
  excludeId?: string,
): Promise<ActionResult<{ available: boolean; reason?: string }>> {
  const actor = await getActor();
  if (!actor) {
    return forbidden;
  }

  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    return {
      success: true,
      data: {
        available: false,
        reason: parsed.error.issues[0]?.message ?? "Invalid slug",
      },
    };
  }

  const available = await isSlugAvailable(parsed.data, excludeId);
  return {
    success: true,
    data: {
      available,
      reason: available ? undefined : "That slug is already in use.",
    },
  };
}

export async function publishAction(id: string): Promise<ActionResult<undefined>> {
  const actor = await getActor();
  if (!actor) {
    return forbidden;
  }

  const result = await publishEvent(actor, id);
  if (!result.ok) {
    return { success: false, error: result.error, message: result.message };
  }

  revalidateEvent(id);
  revalidateCalendar();
  revalidateDashboard();
  return { success: true, data: undefined };
}

export async function unpublishAction(
  id: string,
): Promise<ActionResult<undefined>> {
  const actor = await getActor();
  if (!actor) {
    return forbidden;
  }

  const result = await unpublishEvent(actor, id);
  if (!result.ok) {
    return { success: false, error: result.error, message: result.message };
  }

  revalidateEvent(id);
  revalidateCalendar();
  revalidateDashboard();
  return { success: true, data: undefined };
}

export async function archiveAction(
  id: string,
): Promise<ActionResult<undefined>> {
  const actor = await getActor();
  if (!actor) {
    return forbidden;
  }

  const result = await archiveEvent(actor, id);
  if (!result.ok) {
    return { success: false, error: result.error, message: result.message };
  }

  revalidateEvent(id);
  revalidateCalendar();
  revalidateDashboard();
  return { success: true, data: undefined };
}

export async function deleteEventAction(
  id: string,
): Promise<ActionResult<undefined>> {
  const actor = await getActor();
  if (!actor) {
    return forbidden;
  }

  const result = await deleteEvent(actor, id);
  if (!result.ok) {
    return { success: false, error: result.error, message: result.message };
  }

  revalidateEvent(id);
  revalidateCalendar();
  revalidateDashboard();
  return { success: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

export async function saveQuestionsAction(
  eventId: string,
  questions: QuestionInput[],
): Promise<ActionResult<Question[]>> {
  const actor = await getActor();
  if (!actor) {
    return forbidden;
  }

  const result = await saveQuestions(actor, eventId, questions);
  if (!result.ok) {
    return { success: false, error: result.error, message: result.message };
  }

  revalidateEvent(eventId);
  return { success: true, data: result.data };
}

// ---------------------------------------------------------------------------
// Co-hosts
// ---------------------------------------------------------------------------

export async function addHostAction(
  eventId: string,
  email: string,
  canScan: boolean,
): Promise<ActionResult<undefined>> {
  const actor = await getActor();
  if (!actor) {
    return forbidden;
  }

  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return {
      success: false,
      error: "invalid",
      message: parsed.error.issues[0]?.message ?? "Enter a valid email address.",
    };
  }

  const result = await addHost(actor, eventId, parsed.data, canScan);
  if (!result.ok) {
    return { success: false, error: result.error, message: result.message };
  }

  revalidateEvent(eventId);
  return { success: true, data: undefined };
}

export async function removeHostAction(
  eventId: string,
  userId: string,
): Promise<ActionResult<undefined>> {
  const actor = await getActor();
  if (!actor) {
    return forbidden;
  }

  const parsed = uuidSchema.safeParse(userId);
  if (!parsed.success) {
    return {
      success: false,
      error: "invalid",
      message: parsed.error.issues[0]?.message ?? "Invalid user id.",
    };
  }

  const result = await removeHost(actor, eventId, parsed.data);
  if (!result.ok) {
    return { success: false, error: result.error, message: result.message };
  }

  revalidateEvent(eventId);
  return { success: true, data: undefined };
}

export async function updateHostCanScanAction(
  eventId: string,
  userId: string,
  canScan: boolean,
): Promise<ActionResult<undefined>> {
  const actor = await getActor();
  if (!actor) {
    return forbidden;
  }

  const parsed = uuidSchema.safeParse(userId);
  if (!parsed.success) {
    return {
      success: false,
      error: "invalid",
      message: parsed.error.issues[0]?.message ?? "Invalid user id.",
    };
  }

  const result = await updateHostCanScan(actor, eventId, parsed.data, canScan);
  if (!result.ok) {
    return { success: false, error: result.error, message: result.message };
  }

  revalidateEvent(eventId);
  return { success: true, data: undefined };
}

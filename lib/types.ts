// Shared TypeScript types for the Events module.
// Derived from TRD §4 (data model) and §5 (service interfaces).

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export type UserRole = "organizer" | "admin" | "attendee";
export type UserStatus = "active" | "suspended";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

// ---------------------------------------------------------------------------
// Event shapes
// ---------------------------------------------------------------------------

export type EventStatus = "draft" | "published" | "archived";
export type EventMode = "in_person" | "online" | "hybrid";
export type ModerationStatus = "ok" | "flagged" | "removed";

export interface Event {
  id: string;
  ownerId: string;
  title: string;
  slug: string;
  descriptionMd: string;
  coverUrl: string | null;
  logoUrl: string | null;
  accentColor: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  timezone: string;
  mode: EventMode;
  venue: string | null;
  onlineUrl: string | null;
  capacity: number | null;
  requiresApproval: boolean;
  waitlistEnabled: boolean;
  status: EventStatus;
  moderationStatus: ModerationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventHost {
  eventId: string;
  userId: string;
  canScan: boolean;
}

export interface EventHostWithEmail extends EventHost {
  email: string | null;
}

export type QuestionType = "text" | "select" | "checkbox";

export interface Question {
  id: string;
  eventId: string;
  label: string;
  type: QuestionType;
  options: string[] | null;
  required: boolean;
  position: number;
}

// Calendar card — what the public calendar needs.
export interface EventCard {
  id: string;
  slug: string;
  title: string;
  coverUrl: string | null;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
  mode: EventMode;
  venue: string | null;
  onlineUrl: string | null;
  /** Null until Member 7's users table is available. */
  ownerEmail: string | null;
}

// Register panel state, computed by Member 1's registration service.
export type ViewerState =
  | "register"
  | "registered"
  | "waitlisted"
  | "full"
  | "ended"
  | "closed";

export type CalendarTab = "upcoming" | "past";

// ---------------------------------------------------------------------------
// Service results
// ---------------------------------------------------------------------------

export type Result<T, E extends string = string> =
  | { ok: true; data: T }
  | { ok: false; error: E; message?: string };

/** Serializable shape returned by every server action. */
export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; message?: string };

// ---------------------------------------------------------------------------
// Service inputs
// ---------------------------------------------------------------------------

export interface DraftInput {
  title: string;
}

export interface EventInput {
  title?: string;
  descriptionMd?: string;
  coverUrl?: string | null;
  logoUrl?: string | null;
  accentColor?: string | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  timezone?: string;
  mode?: EventMode;
  venue?: string | null;
  onlineUrl?: string | null;
  capacity?: number | null;
  requiresApproval?: boolean;
  waitlistEnabled?: boolean;
  slug?: string;
}

export interface QuestionInput {
  id?: string;
  label: string;
  type: QuestionType;
  options?: string[] | null;
  required: boolean;
  position: number;
}

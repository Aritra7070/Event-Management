import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const eventStatus = pgEnum("event_status", [
  "draft",
  "published",
  "archived",
]);

export const eventMode = pgEnum("event_mode", [
  "in_person",
  "online",
  "hybrid",
]);

export const moderationStatus = pgEnum("moderation_status", [
  "ok",
  "flagged",
  "removed",
]);

export const questionType = pgEnum("question_type", [
  "text",
  "select",
  "checkbox",
]);

/**
 * events — owned by Member 4.
 *
 * `owner_id` is a uuid without a foreign-key constraint for now. Member 7's
 * users table lands later; the FK is added in a follow-up migration.
 */
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").notNull(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    descriptionMd: text("description_md").notNull().default(""),
    coverUrl: text("cover_url"),
    logoUrl: text("logo_url"),
    accentColor: text("accent_color"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    timezone: text("timezone").notNull().default("UTC"),
    mode: eventMode("mode").notNull().default("in_person"),
    venue: text("venue"),
    onlineUrl: text("online_url"),
    capacity: integer("capacity"),
    requiresApproval: boolean("requires_approval").notNull().default(false),
    waitlistEnabled: boolean("waitlist_enabled").notNull().default(false),
    status: eventStatus("status").notNull().default("draft"),
    moderationStatus: moderationStatus("moderation_status")
      .notNull()
      .default("ok"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("events_slug_lower_idx").on(sql`lower(${t.slug})`),
    index("events_calendar_idx").on(
      t.status,
      t.moderationStatus,
      t.startsAt,
    ),
    index("events_owner_idx").on(t.ownerId),
  ],
);

/**
 * event_hosts — co-hosts. The owner lives on events.owner_id, not here.
 */
export const eventHosts = pgTable(
  "event_hosts",
  {
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    canScan: boolean("can_scan").notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.userId] })],
);

/**
 * questions — custom registration questions.
 *
 * Questions on an event with registrations should not be deleted silently;
 * the service blocks destructive edits when registrations exist (TRD §8.4).
 */
export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    type: questionType("type").notNull().default("text"),
    options: jsonb("options").$type<string[] | null>(),
    required: boolean("required").notNull().default(false),
    position: integer("position").notNull(),
  },
  (t) => [uniqueIndex("questions_event_position_idx").on(t.eventId, t.position)],
);

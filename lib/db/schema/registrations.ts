import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { events } from "./events";

export const registrationStatus = pgEnum("registration_status", [
  "pending",
  "confirmed",
  "waitlisted",
  "declined",
  "cancelled",
]);

export const registrations = pgTable(
  "registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),

    // The users table will be connected when the team adds its schema.
    userId: uuid("user_id").notNull(),

    status: registrationStatus("status")
      .notNull()
      .default("pending"),

    answers: jsonb("answers").$type<Record<string, unknown>>(),

    // Nullable because a ticket may not exist for every registration.
    qrToken: text("qr_token"),

    source: text("source"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    statusChangedAt: timestamp("status_changed_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("registrations_event_user_idx").on(
      table.eventId,
      table.userId,
    ),
    uniqueIndex("registrations_qr_token_idx").on(table.qrToken),
    index("registrations_event_status_idx").on(
      table.eventId,
      table.status,
    ),
  ],
);
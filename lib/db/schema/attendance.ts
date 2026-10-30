import {
  index,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { events } from "./events";

export const checkInMethod = pgEnum("checkin_method", [
  "qr",
  "manual",
]);

export const attendance = pgTable(
  "attendance",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    registrationId: uuid("registration_id").notNull().unique(),

    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),

    checkedInAt: timestamp("checked_in_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    method: checkInMethod("method").notNull(),

    checkedInBy: uuid("checked_in_by").notNull(),
  },
  (table) => [
    index("attendance_event_idx").on(table.eventId),
  ],
);
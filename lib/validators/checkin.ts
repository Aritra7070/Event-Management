import { z } from "zod";

/**
 * Input validation for the Event Check-In module.
 * These schemas validate request data; they do not authenticate the user.
 */

export const checkInByTokenSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  token: z
    .string()
    .min(1, "QR token is required")
    .max(100, "QR token is too long")
    .regex(
      /^[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]{43}$/,
      "Invalid QR token format",
    ),
});

export const manualCheckInSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  registrationId: z.string().uuid("Invalid registration ID"),
});

export type CheckInByTokenInput = z.infer<typeof checkInByTokenSchema>;
export type ManualCheckInInput = z.infer<typeof manualCheckInSchema>;
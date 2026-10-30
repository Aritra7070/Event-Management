import { describe, expect, it } from "vitest";
import {
  checkInByTokenSchema,
  manualCheckInSchema,
} from "./checkin";

describe("checkInByTokenSchema", () => {
  const validToken = `${"a".repeat(43)}.${"b".repeat(43)}`;
  const validEventId = "11111111-1111-4111-8111-111111111111";

  it("accepts a valid event ID and token format", () => {
    expect(
      checkInByTokenSchema.safeParse({
        eventId: validEventId,
        token: validToken,
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid event ID", () => {
    expect(
      checkInByTokenSchema.safeParse({
        eventId: "not-a-uuid",
        token: validToken,
      }).success,
    ).toBe(false);
  });

  it("rejects a malformed QR token", () => {
    expect(
      checkInByTokenSchema.safeParse({
        eventId: validEventId,
        token: "fake-token",
      }).success,
    ).toBe(false);
  });
});

describe("manualCheckInSchema", () => {
  it("accepts valid UUIDs", () => {
    expect(
      manualCheckInSchema.safeParse({
        eventId: "11111111-1111-4111-8111-111111111111",
        registrationId: "22222222-2222-4222-8222-222222222222",
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid registration ID", () => {
    expect(
      manualCheckInSchema.safeParse({
        eventId: "11111111-1111-4111-8111-111111111111",
        registrationId: "invalid",
      }).success,
    ).toBe(false);
  });
});
import { describe, expect, it } from "vitest";
import {
  eventPatchSchema,
  eventSchema,
  publishSchema,
  questionSchema,
  questionsArraySchema,
  slugSchema,
} from "@/lib/validators/events";

describe("slugSchema", () => {
  it("accepts lowercase hyphenated slugs", () => {
    expect(slugSchema.parse("react-india-meetup")).toBe("react-india-meetup");
  });

  it.each([
    ["too short", "ab"],
    ["uppercase", "React-India"],
    ["leading hyphen", "-react"],
    ["trailing hyphen", "react-"],
    ["spaces", "react india"],
  ])("rejects %s", (_label, value) => {
    expect(slugSchema.safeParse(value).success).toBe(false);
  });

  it("rejects reserved slugs", () => {
    expect(slugSchema.safeParse("admin").success).toBe(false);
    expect(slugSchema.safeParse("dashboard").success).toBe(false);
    expect(slugSchema.safeParse("register").success).toBe(false);
  });
});

describe("eventSchema", () => {
  it("accepts an in-person event with a venue", () => {
    const result = eventSchema.safeParse({
      title: "React India Meetup",
      mode: "in_person",
      venue: "Bengaluru",
      startsAt: "2026-03-14T10:00:00Z",
      endsAt: "2026-03-14T12:00:00Z",
      timezone: "Asia/Kolkata",
    });

    expect(result.success).toBe(true);
  });

  it("requires a venue for in-person events", () => {
    const result = eventSchema.safeParse({
      title: "React India Meetup",
      mode: "in_person",
    });

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some((issue) => issue.path.includes("venue")),
    ).toBe(true);
  });

  it("requires an online link for online events", () => {
    const result = eventSchema.safeParse({
      title: "TypeScript Workshop",
      mode: "online",
    });

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some((issue) => issue.path.includes("onlineUrl")),
    ).toBe(true);
  });

  it("rejects an end time before the start time", () => {
    const result = eventSchema.safeParse({
      title: "Backwards",
      startsAt: "2026-03-14T12:00:00Z",
      endsAt: "2026-03-14T10:00:00Z",
    });

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some((issue) => issue.path.includes("endsAt")),
    ).toBe(true);
  });

  it("rejects an invalid timezone", () => {
    expect(
      eventSchema.safeParse({
        title: "Bad timezone",
        timezone: "Mars/Olympus",
      }).success,
    ).toBe(false);
  });
});

describe("eventPatchSchema", () => {
  it("allows an empty patch", () => {
    expect(eventPatchSchema.safeParse({}).success).toBe(true);
  });

  it("allows a partial draft without venue or online link", () => {
    expect(
      eventPatchSchema.safeParse({ title: "Half-filled draft" }).success,
    ).toBe(true);
  });

  it("still checks date order when both dates are present", () => {
    expect(
      eventPatchSchema.safeParse({
        startsAt: "2026-03-14T12:00:00Z",
        endsAt: "2026-03-14T10:00:00Z",
      }).success,
    ).toBe(false);
  });
});

describe("publishSchema", () => {
  const base = {
    title: "React India Meetup",
    slug: "react-india-meetup",
    startsAt: "2026-03-14T10:00:00Z",
    endsAt: "2026-03-14T12:00:00Z",
    timezone: "Asia/Kolkata",
    mode: "in_person" as const,
    venue: "Bengaluru",
  };

  it("accepts a fully specified event", () => {
    expect(publishSchema.safeParse(base).success).toBe(true);
  });

  it.each(["startsAt", "endsAt", "timezone", "mode", "slug"] as const)(
    "requires %s",
    (field) => {
      const input: Record<string, unknown> = { ...base };
      delete input[field];

      expect(publishSchema.safeParse(input).success).toBe(false);
    },
  );
});

describe("questionSchema", () => {
  const textQuestion = {
    label: "Dietary needs",
    type: "text" as const,
    position: 0,
  };

  it("accepts a text question without options", () => {
    expect(questionSchema.safeParse(textQuestion).success).toBe(true);
  });

  it("defaults required to false", () => {
    expect(questionSchema.parse(textQuestion).required).toBe(false);
  });

  it("requires at least two options for select questions", () => {
    expect(
      questionSchema.safeParse({
        label: "T-shirt size",
        type: "select",
        options: ["M"],
        position: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects duplicate select options regardless of case", () => {
    expect(
      questionSchema.safeParse({
        label: "T-shirt size",
        type: "select",
        options: ["M", "m"],
        position: 0,
      }).success,
    ).toBe(false);
  });

  it("accepts a valid select question", () => {
    expect(
      questionSchema.safeParse({
        label: "T-shirt size",
        type: "select",
        options: ["S", "M", "L"],
        position: 1,
      }).success,
    ).toBe(true);
  });
});

describe("questionsArraySchema", () => {
  const question = {
    label: "Name",
    type: "text" as const,
    position: 0,
  };

  it("allows up to 20 questions", () => {
    const questions = Array.from({ length: 20 }, (_, index) => ({
      ...question,
      position: index,
    }));

    expect(questionsArraySchema.safeParse(questions).success).toBe(true);
  });

  it("rejects more than 20 questions", () => {
    const questions = Array.from({ length: 21 }, (_, index) => ({
      ...question,
      position: index,
    }));

    expect(questionsArraySchema.safeParse(questions).success).toBe(false);
  });
});

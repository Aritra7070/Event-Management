import { describe, expect, it } from "vitest";
import {
  formatEventDateRange,
  formatEventLocation,
  getInitials,
  plainTextDescription,
  stripMarkdown,
} from "@/lib/event-display";

describe("stripMarkdown", () => {
  it("removes headings, emphasis, links, images and HTML", () => {
    const markdown = [
      "# Join us",
      "",
      "A **hands-on** _workshop_ with [the team](https://example.com).",
      "![cover](https://example.com/cover.png)",
      "<span>Extra</span> details",
    ].join("\n");

    expect(stripMarkdown(markdown)).toBe(
      "Join us A hands-on workshop with the team. Extra details",
    );
  });

  it("removes fenced code blocks and inline code fencing", () => {
    expect(stripMarkdown("Before\n```ts\nconst x = 1;\n```\nAfter")).toBe(
      "Before After",
    );
    expect(stripMarkdown("Run `npm test` now")).toBe("Run npm test now");
  });

  it("removes list and blockquote markers", () => {
    expect(stripMarkdown("- one\n- two\n\n> quoted")).toBe("one two quoted");
    expect(stripMarkdown("1. first\n2. second")).toBe("first second");
  });
});

describe("plainTextDescription", () => {
  it("returns plain text when it already fits", () => {
    expect(plainTextDescription("A short summary")).toBe("A short summary");
  });

  it("truncates long text with an ellipsis inside the limit", () => {
    const description = plainTextDescription("a".repeat(200), 40);

    expect(description.endsWith("…")).toBe(true);
    expect(description.length).toBeLessThanOrEqual(40);
  });

  it("returns an empty string for empty markdown", () => {
    expect(plainTextDescription("   ")).toBe("");
  });
});

describe("formatEventDateRange", () => {
  it("formats a same-day range in the event timezone", () => {
    const formatted = formatEventDateRange(
      new Date("2026-03-14T10:00:00Z"),
      new Date("2026-03-14T12:00:00Z"),
      "Asia/Kolkata",
    );

    expect(formatted).toContain("Sat, Mar 14, 2026");
    expect(formatted).toContain("3:30 PM");
    expect(formatted).toContain("5:30 PM");
    expect(formatted).toContain("–");
  });

  it("formats a multi-day range with both dates", () => {
    const formatted = formatEventDateRange(
      new Date("2026-03-14T10:00:00Z"),
      new Date("2026-03-16T12:00:00Z"),
      "Asia/Kolkata",
    );

    expect(formatted).toContain("Sat, Mar 14, 2026");
    expect(formatted).toContain("Mon, Mar 16, 2026");
  });

  it("returns a placeholder when the start is missing", () => {
    expect(formatEventDateRange(null, null, "UTC")).toBe(
      "Date to be announced",
    );
  });

  it("falls back to UTC for an invalid timezone", () => {
    const formatted = formatEventDateRange(
      new Date("2026-03-14T10:00:00Z"),
      null,
      "Not/AZone",
    );

    expect(formatted).toContain("Sat, Mar 14, 2026");
    expect(formatted).toContain("10:00 AM");
  });
});

describe("formatEventLocation", () => {
  it("labels online events", () => {
    expect(
      formatEventLocation({ mode: "online", venue: null, onlineUrl: "x" }),
    ).toBe("Online");
  });

  it("shows the venue for in-person events", () => {
    expect(
      formatEventLocation({
        mode: "in_person",
        venue: "Bengaluru",
        onlineUrl: null,
      }),
    ).toBe("Bengaluru");
  });

  it("combines venue and online for hybrid events", () => {
    expect(
      formatEventLocation({
        mode: "hybrid",
        venue: "Delhi",
        onlineUrl: "x",
      }),
    ).toBe("Delhi + online");
  });

  it("falls back when the venue is missing", () => {
    expect(
      formatEventLocation({ mode: "in_person", venue: "  ", onlineUrl: null }),
    ).toBe("Venue to be announced");
  });
});

describe("getInitials", () => {
  it("uses the first two segments of an email local part", () => {
    expect(getInitials("aritra.giri@example.com")).toBe("AG");
    expect(getInitials("aritra@example.com")).toBe("A");
  });

  it("handles missing values", () => {
    expect(getInitials(null)).toBe("?");
    expect(getInitials("")).toBe("?");
  });
});

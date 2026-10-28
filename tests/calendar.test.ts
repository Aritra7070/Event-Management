import { describe, expect, it } from "vitest";
import {
  CALENDAR_PAGE_SIZE,
  calendarHref,
  getCalendarTotalPages,
  parseCalendarQuery,
} from "@/lib/calendar";

describe("parseCalendarQuery", () => {
  it("defaults to the upcoming tab on page 1", () => {
    expect(parseCalendarQuery({})).toEqual({ tab: "upcoming", page: 1 });
    expect(parseCalendarQuery(undefined)).toEqual({
      tab: "upcoming",
      page: 1,
    });
  });

  it("reads the past tab", () => {
    expect(parseCalendarQuery({ tab: "past" })).toEqual({
      tab: "past",
      page: 1,
    });
  });

  it("treats unknown tabs as upcoming", () => {
    expect(parseCalendarQuery({ tab: "featured" }).tab).toBe("upcoming");
  });

  it("parses positive integer pages", () => {
    expect(parseCalendarQuery({ page: "3" })).toEqual({
      tab: "upcoming",
      page: 3,
    });
  });

  it.each(["0", "-2", "abc", "2.5", "", " "])(
    "rejects invalid page %s",
    (page) => {
      expect(parseCalendarQuery({ page }).page).toBe(1);
    },
  );

  it("uses the first value of repeated query parameters", () => {
    expect(
      parseCalendarQuery({
        tab: ["past", "upcoming"],
        page: ["4", "2"],
      }),
    ).toEqual({ tab: "past", page: 4 });
  });
});

describe("getCalendarTotalPages", () => {
  it("returns at least one page", () => {
    expect(getCalendarTotalPages(0)).toBe(1);
    expect(getCalendarTotalPages(-5)).toBe(1);
  });

  it("calculates page counts from the page size", () => {
    expect(getCalendarTotalPages(1)).toBe(1);
    expect(getCalendarTotalPages(CALENDAR_PAGE_SIZE)).toBe(1);
    expect(getCalendarTotalPages(CALENDAR_PAGE_SIZE + 1)).toBe(2);
    expect(getCalendarTotalPages(CALENDAR_PAGE_SIZE * 2)).toBe(2);
    expect(getCalendarTotalPages(CALENDAR_PAGE_SIZE * 2 + 1)).toBe(3);
  });

  it("supports a custom page size", () => {
    expect(getCalendarTotalPages(21, 10)).toBe(3);
    expect(getCalendarTotalPages(20, 10)).toBe(2);
  });

  it("falls back safely for invalid page sizes", () => {
    expect(getCalendarTotalPages(13, 0)).toBe(2);
    expect(getCalendarTotalPages(13, Number.NaN)).toBe(2);
  });
});

describe("calendarHref", () => {
  it("omits defaults", () => {
    expect(calendarHref("upcoming")).toBe("/events");
    expect(calendarHref("upcoming", 0)).toBe("/events");
  });

  it("keeps the past tab", () => {
    expect(calendarHref("past")).toBe("/events?tab=past");
  });

  it("adds pagination", () => {
    expect(calendarHref("upcoming", 2)).toBe("/events?page=2");
    expect(calendarHref("past", 3)).toBe("/events?tab=past&page=3");
  });
});

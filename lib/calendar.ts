import type { CalendarTab } from "@/lib/types";

export const CALENDAR_PAGE_SIZE = 12;

export interface CalendarQuery {
  tab: CalendarTab;
  page: number;
}

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Parse and clamp the public calendar query string.
 *
 * Only `tab=past` switches tabs; anything else falls back to upcoming so a
 * malformed link can never hide the primary listing. Pages are positive
 * integers, defaulting to 1.
 */
export function parseCalendarQuery(
  searchParams: SearchParams | undefined,
): CalendarQuery {
  const tab = firstValue(searchParams?.tab) === "past" ? "past" : "upcoming";
  const rawPage = firstValue(searchParams?.page);
  const parsedPage = rawPage === undefined ? 1 : Number(rawPage);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  return { tab, page };
}

export function getCalendarTotalPages(
  total: number,
  pageSize: number = CALENDAR_PAGE_SIZE,
): number {
  const safeTotal = Number.isFinite(total) ? Math.max(0, total) : 0;
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0
      ? Math.trunc(pageSize)
      : CALENDAR_PAGE_SIZE;

  return Math.max(1, Math.ceil(safeTotal / safePageSize));
}

/**
 * Build a calendar URL. Page 1 and the default upcoming tab are omitted so
 * the canonical link stays short.
 */
export function calendarHref(tab: CalendarTab, page: number = 1): string {
  const safePage = Number.isInteger(page) && page > 1 ? page : 1;
  const params = new URLSearchParams();

  if (tab === "past") {
    params.set("tab", "past");
  }

  if (safePage > 1) {
    params.set("page", String(safePage));
  }

  const query = params.toString();
  return query ? `/events?${query}` : "/events";
}

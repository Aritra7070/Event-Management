export const SITE_NAME = "EventSphere";

export const SITE_DESCRIPTION =
  "Create, publish, and run events with EventSphere — a modern event management platform for organizers and attendees.";

/**
 * Canonical base URL used by metadata, Open Graph tags and absolute links.
 * Falls back to localhost during development and builds without env values.
 */
export function getBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const url = configured && configured.length > 0
    ? configured
    : "http://localhost:3000";

  return url.replace(/\/+$/, "");
}

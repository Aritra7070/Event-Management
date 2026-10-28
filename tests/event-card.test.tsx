import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EventCard } from "@/components/events/EventCard";
import type { EventCard as EventCardData } from "@/lib/types";

const event: EventCardData = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "react-india-meetup",
  title: "React India Meetup",
  coverUrl: null,
  startsAt: new Date("2026-03-14T10:00:00Z"),
  endsAt: new Date("2026-03-14T12:00:00Z"),
  timezone: "Asia/Kolkata",
  mode: "in_person",
  venue: "Bengaluru",
  onlineUrl: null,
  ownerEmail: "aritra@example.com",
};

describe("EventCard", () => {
  it("links to the public event page and shows the key details", () => {
    render(<EventCard event={event} />);

    const link = screen.getByRole("link", { name: /React India Meetup/i });
    expect(link).toHaveAttribute("href", "/e/react-india-meetup");

    expect(
      screen.getByRole("heading", { name: "React India Meetup" }),
    ).toBeInTheDocument();
    expect(screen.getByText("In person")).toBeInTheDocument();
    expect(screen.getByText("Bengaluru")).toBeInTheDocument();
    expect(screen.getByText(/Sat, Mar 14, 2026/)).toBeInTheDocument();
    expect(screen.getByText("View event")).toBeInTheDocument();
  });

  it("shows the online label and location for online events", () => {
    render(
      <EventCard
        event={{
          ...event,
          mode: "online",
          venue: null,
          onlineUrl: "https://example.com/live",
        }}
      />,
    );

    expect(screen.getAllByText("Online")).toHaveLength(2);
  });
});

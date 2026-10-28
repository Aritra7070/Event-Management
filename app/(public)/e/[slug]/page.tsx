import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventPage } from "@/components/events/EventPage";
import {
  formatEventDateRange,
  plainTextDescription,
} from "@/lib/event-display";
import { getPublicEventData } from "@/lib/public-events";
import {
  getConfirmedCount,
  getViewerState,
} from "@/lib/services/registrations-stub";
import { getBaseUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

interface PublicEventPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PublicEventPageProps): Promise<Metadata> {
  const data = await getPublicEventData(params.slug);

  if (!data) {
    return {
      title: "Event not found",
      robots: { index: false, follow: false },
    };
  }

  const { event } = data;
  const description =
    plainTextDescription(event.descriptionMd) ||
    `${event.title} — ${formatEventDateRange(
      event.startsAt,
      event.endsAt,
      event.timezone,
    )}`;
  const canonical = `${getBaseUrl()}/e/${event.slug}`;
  const imageUrl = event.coverUrl ?? event.logoUrl;
  const images = imageUrl
    ? [{ url: imageUrl, alt: event.title }]
    : undefined;

  return {
    title: event.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: event.title,
      description,
      type: "website",
      url: canonical,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function PublicEventPage({
  params,
}: PublicEventPageProps) {
  const data = await getPublicEventData(params.slug);

  if (!data) {
    notFound();
  }

  const [confirmedCount, viewerState] = await Promise.all([
    getConfirmedCount(data.event.id),
    // TODO(auth): replace null with the signed-in user id when Member 7 lands.
    getViewerState(null, data.event.id),
  ]);

  return (
    <EventPage
      event={data.event}
      questions={data.questions}
      hosts={data.hosts}
      ownerEmail={data.ownerEmail}
      confirmedCount={confirmedCount}
      initialViewerState={viewerState ?? undefined}
      mode="public"
    />
  );
}

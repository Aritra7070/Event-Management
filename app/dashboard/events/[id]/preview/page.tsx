import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventPage } from "@/components/events/EventPage";
import { getUserEmail, requireRole } from "@/lib/auth-stubs";
import {
  canManageEvent,
  getEventById,
  getQuestions,
} from "@/lib/services/events";
import { getEventHosts } from "@/lib/services/hosts";
import { getConfirmedCount } from "@/lib/services/registrations-stub";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Event preview",
  robots: { index: false, follow: false },
};

interface PreviewPageProps {
  params: { id: string };
}

export default async function PreviewEventPage({ params }: PreviewPageProps) {
  const user = await requireRole(["organizer", "admin"]);
  const event = await getEventById(params.id);

  if (!event || !(await canManageEvent(user.id, event.id))) {
    notFound();
  }

  const [questions, hosts, ownerEmail, confirmedCount] = await Promise.all([
    getQuestions(event.id),
    getEventHosts(event.id),
    getUserEmail(event.ownerId),
    getConfirmedCount(event.id),
  ]);

  return (
    <EventPage
      event={event}
      questions={questions}
      hosts={hosts}
      ownerEmail={ownerEmail}
      confirmedCount={confirmedCount}
      mode="preview"
    />
  );
}

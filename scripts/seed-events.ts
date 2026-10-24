import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });
config();

import { STUB_HOST, STUB_ORGANIZER } from "../lib/auth-stubs";
import { getDb } from "../lib/db";
import { eventHosts, events, questions } from "../lib/db/schema";
import type {
  EventMode,
  EventStatus,
  ModerationStatus,
  QuestionType,
} from "../lib/types";
import { getEventBySlug } from "../lib/services/events";

type SeedQuestion = {
  label: string;
  type: QuestionType;
  options?: string[];
  required?: boolean;
};

type SeedHost = {
  userId: string;
  canScan: boolean;
};

type SeedEvent = {
  title: string;
  slug: string;
  descriptionMd: string;
  startsAt: Date | null;
  endsAt: Date | null;
  timezone: string;
  mode: EventMode;
  venue: string | null;
  onlineUrl: string | null;
  capacity: number | null;
  requiresApproval: boolean;
  waitlistEnabled: boolean;
  status: EventStatus;
  moderationStatus: ModerationStatus;
  accentColor: string | null;
  questions: SeedQuestion[];
  hosts: SeedHost[];
};

const now = new Date();

function daysFromNow(days: number, utcHour = 10): Date {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(utcHour, 0, 0, 0);
  return date;
}

const SEED_EVENTS: SeedEvent[] = [
  {
    title: "React India Meetup",
    slug: "react-india-meetup",
    descriptionMd:
      "## About\n\nA community evening for React developers in Bengaluru.\n\n- Two talks\n- Q&A with the speakers\n- Networking after the event\n\nBring a laptop if you want to follow along.",
    startsAt: daysFromNow(14, 10),
    endsAt: daysFromNow(14, 14),
    timezone: "Asia/Kolkata",
    mode: "in_person",
    venue: "Bengaluru Convention Centre, Hall 2",
    onlineUrl: null,
    capacity: 100,
    requiresApproval: false,
    waitlistEnabled: true,
    status: "published",
    moderationStatus: "ok",
    accentColor: "#2563eb",
    questions: [
      {
        label: "What is your GitHub username?",
        type: "text",
        required: true,
      },
      {
        label: "Any dietary preferences?",
        type: "text",
        required: false,
      },
    ],
    hosts: [{ userId: STUB_HOST.id, canScan: true }],
  },
  {
    title: "Online TypeScript Workshop",
    slug: "online-typescript-workshop",
    descriptionMd:
      "A hands-on online workshop covering strict TypeScript, Zod validation and typed service boundaries. A meeting link is emailed after registration.",
    startsAt: daysFromNow(21, 12),
    endsAt: daysFromNow(21, 15),
    timezone: "UTC",
    mode: "online",
    venue: null,
    onlineUrl: "https://example.com/typescript-workshop",
    capacity: null,
    requiresApproval: true,
    waitlistEnabled: false,
    status: "published",
    moderationStatus: "ok",
    accentColor: null,
    questions: [
      {
        label: "I agree to the code of conduct",
        type: "checkbox",
        required: true,
      },
    ],
    hosts: [],
  },
  {
    title: "Past Hybrid Demo Day",
    slug: "past-hybrid-demo-day",
    descriptionMd:
      "Student teams demo their semester projects to mentors and guests. This is a past event used to exercise the Past tab of the calendar.",
    startsAt: daysFromNow(-2, 9),
    endsAt: daysFromNow(-1, 17),
    timezone: "Asia/Kolkata",
    mode: "hybrid",
    venue: "Kolkata Tech Hub",
    onlineUrl: "https://example.com/demo-day",
    capacity: 60,
    requiresApproval: false,
    waitlistEnabled: false,
    status: "published",
    moderationStatus: "ok",
    accentColor: "#0f766e",
    questions: [],
    hosts: [],
  },
  {
    title: "Draft Community Idea",
    slug: "draft-community-idea",
    descriptionMd: "",
    startsAt: null,
    endsAt: null,
    timezone: "UTC",
    mode: "in_person",
    venue: null,
    onlineUrl: null,
    capacity: null,
    requiresApproval: false,
    waitlistEnabled: false,
    status: "draft",
    moderationStatus: "ok",
    accentColor: null,
    questions: [],
    hosts: [],
  },
  {
    title: "Archived Design Sprint",
    slug: "archived-design-sprint",
    descriptionMd:
      "A three-day design sprint that has been archived. Archived events are hidden from the public calendar but remain in the organizer dashboard.",
    startsAt: daysFromNow(-10, 9),
    endsAt: daysFromNow(-9, 18),
    timezone: "Asia/Kolkata",
    mode: "in_person",
    venue: "Mumbai Design Studio",
    onlineUrl: null,
    capacity: 30,
    requiresApproval: false,
    waitlistEnabled: false,
    status: "archived",
    moderationStatus: "ok",
    accentColor: "#7c3aed",
    questions: [
      {
        label: "Experience level",
        type: "select",
        options: ["Beginner", "Advanced"],
        required: true,
      },
    ],
    hosts: [],
  },
];

async function seed(): Promise<void> {
  const db = getDb();

  for (const seedEvent of SEED_EVENTS) {
    const { questions: seedQuestions, hosts: seedHosts, ...fields } = seedEvent;
    const existing = await getEventBySlug(seedEvent.slug);

    let eventId: string;

    if (existing) {
      await db
        .update(events)
        .set({ ...fields, updatedAt: new Date() })
        .where(eq(events.id, existing.id));
      eventId = existing.id;
    } else {
      const [inserted] = await db
        .insert(events)
        .values({
          ownerId: STUB_ORGANIZER.id,
          ...fields,
        })
        .returning({ id: events.id });
      eventId = inserted.id;
    }

    await db.delete(questions).where(eq(questions.eventId, eventId));
    await db.delete(eventHosts).where(eq(eventHosts.eventId, eventId));

    if (seedQuestions.length > 0) {
      await db.insert(questions).values(
        seedQuestions.map((question, position) => ({
          eventId,
          label: question.label,
          type: question.type,
          options: question.options ?? null,
          required: question.required ?? false,
          position,
        })),
      );
    }

    if (seedHosts.length > 0) {
      await db.insert(eventHosts).values(
        seedHosts.map((host) => ({
          eventId,
          userId: host.userId,
          canScan: host.canScan,
        })),
      );
    }
  }

  console.log(`Seeded ${SEED_EVENTS.length} events`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

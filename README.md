# Event Management Platform — Events Module

Member 4 (Aritra Giri): page builder, event page, lifecycle, organizer dashboard and calendar.

Stack: Next.js 14 App Router · TypeScript strict · Tailwind CSS · Drizzle ORM · Neon PostgreSQL · Zod · Vercel Blob.

## Setup

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
```

Fill in `DATABASE_URL` (Neon) and `BLOB_READ_WRITE_TOKEN` (Vercel Blob). Auth is stubbed until Member 7 delivers the shared Auth.js layer.

```bash
npm run db:generate   # generate SQL migrations from lib/db/schema
npm run db:push       # apply the schema to the Neon database
npm run db:seed       # insert 5 demo events + questions + a co-host
npm run dev
```

`npm run build` works without a database because the Drizzle clients are lazy.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build + type/lint check |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Drizzle SQL migrations |
| `npm run db:push` | Push the schema to Neon |
| `npm run db:seed` | Seed demo events |
| `npm test` | Vitest (tests land in the test phase) |

## Module layout

```
app/                          Next.js routes (added in later phases)
components/events/            EventPage, EventCard, RegisterPanel, builder sections
lib/db/schema/events.ts       events, event_hosts, questions
lib/validators/events.ts      Zod schemas and slug rules
lib/services/events.ts        P0 read functions + event writes
lib/services/questions.ts     transactional question editor
lib/services/hosts.ts         co-host management
lib/services/registrations-stub.ts  Member 1 integration seam
lib/cache.ts                  Next.js cache tags
scripts/seed-events.ts        5-event demo seed
drizzle/                      generated migrations
```

## Interface contract for the rest of the team

These are exported from `lib/services/events.ts` and work with seed data:

```ts
getEventBySlug(slug: string): Promise<Event | null>
getEventById(id: string): Promise<Event | null>
canManageEvent(userId: string, eventId: string): Promise<boolean>
listPublishedEvents(opts: { tab: "upcoming" | "past"; page: number; pageSize: number })
getQuestions(eventId: string): Promise<Question[]>
```

`lib/auth-stubs.ts` and `lib/services/registrations-stub.ts` are the two files to replace when Members 7 and 1 deliver.

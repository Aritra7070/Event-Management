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
app/dashboard/events/         organizer list, new-event form, edit page
app/dashboard/events/[id]/preview/  organizer preview of the shared event page
app/dashboard/events/actions.ts  server actions for builder + lifecycle
app/(public)/e/[slug]/        public event page + metadata
app/api/blob/upload/          Vercel Blob client-upload token route
components/events/            EventPage, RegisterPanel, TrackView, MarkdownRenderer, StatusBadge
components/events/builder/    9 builder sections + lifecycle actions
lib/db/schema/events.ts       events, event_hosts, questions
lib/validators/events.ts      Zod schemas and slug rules
lib/services/events.ts        P0 read functions + event writes
lib/services/questions.ts     transactional question editor
lib/services/hosts.ts         co-host management
lib/services/registrations-stub.ts  Member 1 integration seam
lib/public-events.ts          public loader + visibility filter + related-data cache
lib/event-display.ts          date, location and Markdown formatting helpers
lib/cache.ts                  Next.js cache tags
scripts/seed-events.ts        5-event demo seed
drizzle/                      generated migrations
```

## Builder routes

- `/dashboard/events` — organizer dashboard (always dynamic)
- `/dashboard/events/new` — title form; creates a private draft only on submit
- `/dashboard/events/[id]/edit` — builder with auto-save per section
- `/dashboard/events/[id]/preview` — organizer preview using the shared `EventPage` (dynamic, uncached)
- `/e/[slug]` — public event page (dynamic; drafts, archived and removed events return 404)

The new-event page deliberately does **not** create a draft during render, so
refreshing or prefetching `/dashboard/events/new` cannot create junk drafts.

## Public event page

`/e/[slug]` renders the shared `EventPage` with `mode="public"`.

- Only `status = "published"` and `moderation_status = "ok"` events resolve. Drafts, archived events, removed events and unknown slugs return `404` — including from `generateMetadata()`, so a hidden title never leaks.
- The event row is fetched fresh on each request. Questions and hosts are cached for 300 seconds and invalidated by `revalidateEvent()`.
- `generateMetadata()` supplies title, description, canonical URL, Open Graph and Twitter cards from the event; descriptions are Markdown-stripped and truncated to 160 characters.
- `RegisterPanel` links to `/e/[slug]/register`, which is Member 1's route. Until it lands, the CTA bounces to a 404 by design.
- `TrackView` is a no-op stub for Member 3's analytics.
- `/dashboard/events/[id]/preview` uses the same layout with `mode="preview"`, adds a preview banner and renders the registration questions read-only. It requires an organizer/admin who can manage the event.

Both routes are `force-dynamic`, so `next build` never queries the database.

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

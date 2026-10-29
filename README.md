# EventSphere 🎟️

EventSphere is a full-featured event management platform for creating, publishing, and running events. This repository contains Member 4's Events module: the organizer page builder, the shared public/preview event page, lifecycle controls, the registration panel, and the public calendar.

Built with Next.js 14 App Router, TypeScript, Tailwind CSS, Drizzle ORM, Neon PostgreSQL, Zod, and Vercel Blob.

## 🌟 Key Features

### 🎨 Event Page Builder

- Section-by-section auto-save for basics, date/time, mode and venue, capacity, hosts, images, accent colour, and custom questions.
- Markdown descriptions rendered with a sanitized renderer.
- Cover and logo uploads through Vercel Blob.
- Slug editing with reserved-word and availability checks.

### 🔄 Event Lifecycle

- Draft, publish, unpublish, archive, and delete flows.
- Publish-time validation ensures the title, slug, dates, timezone, mode, and venue or online link are complete.
- Every write invalidates the relevant public, calendar, and dashboard cache tags.

### 🌐 Public Event Page

- `/e/[slug]` with SEO metadata, Open Graph and Twitter cards, canonical URLs, and timezone-aware date ranges.
- Drafts, archived events, removed events, and unknown slugs return `404`, including from `generateMetadata()`, so hidden titles never leak.
- Registration panel covers approval, full/waitlist, ended, closed, draft, archived, and removed states.
- Shareable `EventPage` layout reused by the authenticated organizer preview.

### 📅 Public Calendar

- `/events` lists published events in upcoming or past order, 12 per page.
- Upcoming/Past tabs and accessible pagination preserve the active view.
- Cards show the cover, date range, mode, and location, and link to `/e/[slug]`.
- Draft, archived, and removed events never appear because the listing reuses the public visibility rules.

### 🗓️ Organizer Dashboard & Preview

- Event list with status badges and lifecycle actions.
- Create a private draft from a title-only form.
- Live preview of the exact public page, with a preview banner and read-only registration questions.

### 🧩 Team Integration

- Auth, registration persistence, check-in, analytics, and sharing stay behind documented stubs and contracts.
- Five read functions expose the Events module to the rest of the platform without leaking implementation details.

## 🛠️ Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | Next.js 14 App Router, React 18, TypeScript strict, Tailwind CSS |
| Database | Neon PostgreSQL, Drizzle ORM, Next.js server actions |
| Validation | Zod |
| Storage | Vercel Blob |
| Content | react-markdown, rehype-sanitize, date-fns-tz |
| Testing | Vitest |

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or newer.
- A Neon PostgreSQL database.
- A Vercel Blob read/write token.

### Installation

```bash
git clone https://github.com/Aritra7070/Event-Management.git
cd Event-Management
npm install
```

### Environment Setup

Create `.env.local` from `.env.example` (Windows: `copy .env.example .env.local`) and fill in:

```env
# Neon PostgreSQL — pooled connection string
DATABASE_URL=your_neon_connection_string

# Vercel Blob — read/write token
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Auth.js — reserved for Member 7's auth layer
AUTH_SECRET=your_auth_secret
AUTH_URL=http://localhost:3000

# Canonical URL used in metadata and OG tags
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Never commit `.env.local` or any real credentials.

### Database Setup

```bash
npm run db:generate   # generate SQL migrations from lib/db/schema
npm run db:push       # apply the schema to the Neon database
npm run db:seed       # insert 5 demo events, questions, and a co-host
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The organizer dashboard lives at `/dashboard/events`.

`npm run build` works without a database because the Drizzle clients are created lazily.

## 📚 API & Core Services

The Events module exports these reads from `lib/services/events.ts`:

```ts
getEventBySlug(slug: string): Promise<Event | null>
getEventById(id: string): Promise<Event | null>
canManageEvent(userId: string, eventId: string): Promise<boolean>
listPublishedEvents(opts: { tab: "upcoming" | "past"; page: number; pageSize: number })
getQuestions(eventId: string): Promise<Question[]>
```

`lib/auth-stubs.ts` and `lib/services/registrations-stub.ts` are the replacement seams for Members 7 and 1. Everything else imports from those modules, so the swap is a one-file change on each side.

## Routes

| Route | Purpose |
| --- | --- |
| `/dashboard/events` | Organizer event list |
| `/dashboard/events/new` | Title-only draft creation |
| `/dashboard/events/[id]/edit` | Section-based event builder |
| `/dashboard/events/[id]/preview` | Authenticated preview of the public page |
| `/events` | Public upcoming/past calendar |
| `/e/[slug]` | Public event page with metadata |

The public routes (`/events`, `/e/[slug]`) and the preview route are `force-dynamic`, so `next build` never queries the database.

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
| `npm test` | Run the Vitest suite |

## Project Status

- **Dashboard quick links** — organizer shortcuts to preview and public pages are next.
- **Registration route** — `/e/[slug]/register` belongs to Member 1; the Register CTA is wired to it and returns 404 until it lands.
- **Auth** — Member 7's real Auth.js layer replaces `lib/auth-stubs.ts`.
- **Analytics and check-in** — stubs reserved for Members 3 and 2.

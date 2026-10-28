python : Traceback (most recent call last):
At line:1 char:1
+ python -c "
+ ~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (Traceback (most recent call last) 
   ::String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
  File "<string>", line 18, in <module>
  File "C:\Users\aritr\AppData\Local\Programs\Python\Python311\Lib\encodings\cp
1252.py", line 19, in encode
    return codecs.charmap_encode(input,self.errors,encoding_table)[0]
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
UnicodeEncodeError: 'charmap' codec can't encode character '\u2502' in 
position 420: character maps to <undefined>
================================================================================
FILE: c:\projects\Event-Management\PRD Events Module (Page Builder and Calendar).pdf
================================================================================
--- PAGE 1 ---
PRD: Events Module (Page Builder and Calendar)
PRD: Events Module (Page Builder and
Calendar)
Event Management Platform ╖ Member 4 ╖ Owner: Aritra Giri ╖ Version 1.0 ╖ 24 Oct 2026
1. Overview
The Events module lets organizers build, publish and manage event pages, and lets
everyone discover events in a public calendar. It is the entry point of the platform flow
(Create Event, Publish, Share, Register, Check In, Analyze). Every other module reads
event data from this one, so it is both a user-facing feature and a shared dependency.
2. Problem statement
Organizers of college and community events today use scattered tools: a form for
registration, a poster for promotion, a spreadsheet for tracking. There is no single place to
describe an event, set its rules (capacity, approval, waitlist), collect custom registration
details and publish a page that looks good on a phone. Attendees have no single place to
browse what is happening.
3. Goals and non-goals
Goals
G1. An organizer can go from a blank form to a live public page in under 10 minutes.
G2. The public page and the organizer preview look identical.
G3. Published events appear in the calendar without manual steps.
G4. Other modules can read event data from stable, documented functions from the
first week.
G5. Event rules (slug, dates, capacity, permissions) are enforced on the server, never
only in the browser.
Non-goals (this version)
Ticket pricing and payments.
Recurring events and multi-session schedules.
Page 1 of 10
--- PAGE 2 ---
PRD: Events Module (Page Builder and Calendar)
Event search by keyword, category filters and maps (candidates for a later version).
Custom domains for event pages.
Registration, check-in, sharing and analytics logic (owned by Members 1, 2, 5 and 3).
4. Users
User Description Main needs
Organizer Signed-in user who creates Build a page fast, control
events registration rules, see status of
events
Co-host Added by the organizer by email Edit the event; optionally scan
tickets at the door
Attendee Anyone browsing, often on a Find events, read details, see
phone whether they can register
Admin Platform moderator Edit or unpublish any event; events
they remove disappear from the
calendar
Other team Registration, check-in, analytics, Reliable event, host and question
modules sharing, admin data
5. User stories
Organizer
O1. As an organizer, I can create a draft event and save it at any point, so I do not lose
work.
O2. I can write the description in Markdown and see a live preview.
O3. I can upload a cover image, a logo and choose an accent colour.
O4. I can set start and end time in the event's timezone.
O5. I can say whether the event is in person, online or hybrid and give the venue or link.
O6. I can choose my own URL slug and see immediately whether it is free.
O7. I can set capacity, require approval, and turn the waitlist on or off.
Page 2 of 10
--- PAGE 3 ---
PRD: Events Module (Page Builder and Calendar)
O8. I can add custom registration questions (text, select, checkbox), reorder them and
mark them required.
O9. I can add co-hosts by email and decide whether each may scan tickets.
O10. I can preview the page exactly as attendees will see it before publishing.
O11. I can publish, unpublish and archive my event.
O12. I can see all my events with their status, registration count and quick links to
registrations, check-in, analytics and sharing.
Attendee
A1. I can browse upcoming and past events in a calendar with pagination.
A2. I can open an event page that works well on mobile.
A3. I can see at a glance if I can register, am registered, am waitlisted, the event is full or
it has ended.
A4. Links to the event show a good title and description when shared.
Admin
D1. I can edit and unpublish any event.
D2. Events I mark as removed never appear in the calendar or on public pages.
6. Functional requirements
Priority: P0 must have, P1 should have, P2 nice to have.
6.1 Page builder
ID Requirement Priority
FR-1 Create and save a draft with title only; remaining P0
fields are completed later
FR-2 Markdown description with live preview; output is P0
sanitized and raw HTML is not rendered
FR-3 Start and end time with an event timezone; end P0
must be after start
Page 3 of 10
--- PAGE 4 ---
PRD: Events Module (Page Builder and Calendar)
ID Requirement Priority
FR-4 Mode (in person, online, hybrid); venue required P0
for in person and hybrid, link required for online
and hybrid
FR-5 Custom slug: lowercase letters, digits, hyphens, 3 P0
to 60 characters, unique regardless of case,
reserved words blocked, live availability check
FR-6 Capacity (optional number), approval required P0
toggle, waitlist toggle
FR-7 Custom question editor: text, select, checkbox; P0
required flag; add, reorder, remove
FR-8 Cover image upload to Vercel Blob with limits on P0
type and size
FR-9 Logo and accent colour branding P1
FR-10 Hosts and co-hosts added by email, with a scan- P0
permission toggle
FR-11 Capacity cannot be set below the current P0
confirmed registration count
Page 4 of 10
--- PAGE 5 ---
PRD: Events Module (Page Builder and Calendar)
6.2 Event page
ID Requirement Priority
FR-12 One shared EventPage component for the public P0
route and the preview
FR-13 States: draft preview, published, ended P0
FR-14 Register panel showing register, registered, P0
waitlisted, full or ended, linking to Member 1's flow
FR-15 Page metadata (title, description, Open Graph) for P0
search and sharing
FR-16 Member 3's tracker embedded on the public page P0
FR-17 Mobile-first layout that is usable at 360 px width P0
6.3 Lifecycle
ID Requirement Priority
FR-18 Publish with full validation; unpublish back to draft P0
FR-19 Archive instead of delete when registrations exist P0
FR-20 Cached pages are refreshed after every change P0
FR-21 Only the owner, co-hosts and admins can edit P0
6.4 Dashboard and calendar
ID Requirement Priority
FR-22 Organizer list: status, registration count, links to P0
registrations, check-in, analytics, share
FR-23 Public calendar with upcoming and past tabs and P0
pagination
FR-24 Event cards show cover, date, location and host P0
Page 5 of 10
--- PAGE 6 ---
PRD: Events Module (Page Builder and Calendar)
ID Requirement Priority
FR-25 Drafts and moderated-out events are excluded P0
from the calendar
FR-26 Empty states for no events, no results and no cover P1
image
6.5 Shared read functions (contract with other members)
getEventBySlug , getEventById , canManageEvent(userId, eventId) ,
listPublishedEvents , getQuestions(eventId) . These are P0 and must be delivered in
the first days, before the builder UI is finished.
7. Business rules
1. Only published events are visible to the public. Drafts are visible only to people who
can manage them.
2. Slugs are unique ignoring case and cannot be a reserved word. The reserved list comes
from Member 6's platform settings.
3. Events with registrations are archived, never deleted. Drafts with no registrations may
be deleted.
4. Capacity may be raised at any time. It may not be lowered below the confirmed count.
5. Changing the slug of a published event keeps the old public page refreshed in cache
and is warned about in the UI, because shared links may break.
6. Times are stored in UTC and displayed in the event's timezone.
7. Removed (moderated) events are hidden everywhere public and cannot be
republished by the organizer.
8. Non-functional requirements
Area Requirement
Performance Public event page and calendar render from cache;
Largest Contentful Paint under 2.5 s on a mid-range
phone over 4G
Page 6 of 10
--- PAGE 7 ---
PRD: Events Module (Page Builder and Calendar)
Area Requirement
Security Every action validates input with Zod, checks role
and ownership; Markdown is sanitized; uploads
limited to images with a size cap; the client is never
trusted for owner or status
Accessibility Form fields have labels, keyboard navigation works,
colour contrast meets WCAG AA, including with a
custom accent colour
Responsiveness Works from 360 px up; the builder is usable on a
tablet
Reliability Drafts are never lost on a failed publish; validation
errors show next to the field
Maintainability Services hold all database access; components
never call the database
9. Key screens
1. Event builder (new and edit): sectioned form with a sticky Save and Preview bar.
2. Preview: the same EventPage with a draft banner.
3. Public event page /e/[slug] .
4. Organizer list /dashboard/events .
5. Public calendar /events .
10. Dependencies
Depends For Fallback until delivered
on
Member 7 Auth, roles, session, project Stubbed getCurrentUser and
foundation requireRole
Member 6 Reserved slugs setting Hardcoded list
Member 3 <TrackView /> Empty component
Page 7 of 10
--- PAGE 8 ---
PRD: Events Module (Page Builder and Calendar)
Depends For Fallback until delivered
on
Member 1 Registration flow and confirmed Count of 0; register button disabled
count
Member 5 Share URL helper and Open Graph Not required for first release
image
11. Success metrics
An organizer completes blank form to live page in under 10 minutes in a usability run
with three people.
Zero public pages show draft or removed events in testing.
Preview and public page match in a side-by-side check.
Other members report no blockers on the event read functions after week 1.
Slug and permission tests pass.
12. Milestones
Milestone Target
M0 Repo initialized, skeleton pushed Day 1
M1 Schema and read functions, seed data Day 3
published
M2 Validation rules complete Day 4
M3 Builder form complete with uploads Day 8
M4 EventPage and register panel Day 10
M5 Lifecycle actions and cache refresh Day 11
M6 Dashboard list and calendar Day 13
M7 Tests, preview deployment demo, handoff Day 14
Page 8 of 10
--- PAGE 9 ---
PRD: Events Module (Page Builder and Calendar)
13. Risks and mitigations
Risk Impact Mitigation
Other members blocked on event High Ship read layer and seed data first
data
Two people scaffold the repo Medium Tell Member 7 up front that Member 4
initializes
Builder form grows too large Medium Build in sections; ship drag-and-drop and
branding last
Timezone bugs Medium Store UTC, convert only at display, test
across zones
Unsafe Markdown or uploads High Sanitize output, restrict upload type and
size, authorize in the token route
Slug changes break shared links Medium Warning in UI; consider slug history later
14. Acceptance criteria
An organizer can create a draft, fill every section, preview, publish, and see the event in
/events .
A visitor cannot open a draft by URL; the owner can.
A stranger cannot edit someone else's event; a co-host and an admin can.
Invalid slugs, reversed dates and too-low capacity are rejected with clear messages.
Archiving works for events with registrations; deletion is blocked.
The page works on a phone and the calendar paginates.
All of this is demonstrated on a Vercel preview deployment.
15. Open questions
Does the team keep a slug history or redirects for renamed events?
Should co-hosts be able to publish, or only edit?
Is there a maximum number of custom questions per event?
Page 9 of 10
--- PAGE 10 ---
PRD: Events Module (Page Builder and Calendar)
Who sets the default timezone: the organizer's profile or the platform setting from
Member 6?
Are past events public forever, or archived from the calendar after a period?
Page 10 of 10

================================================================================
FILE: c:\projects\Event-Management\TRD Events Module (Page Builder and Calendar).pdf
================================================================================
--- PAGE 1 ---
TRD: Events Module (Page Builder and Calendar)
TRD: Events Module (Page Builder and
Calendar)
Event Management Platform ╖ Member 4 ╖ Owner: Aritra Giri ╖ Version 1.0 ╖ 24 Oct 2026 ╖
Companion to the PRD
1. Purpose and scope
This document describes how the Events module is built: stack, architecture, data model,
service interfaces, validation, security, caching, testing and deployment. It covers the
events , event_hosts and questions tables and everything that reads or writes them.
Registration, check-in, analytics, sharing, admin settings and auth are owned by other
members and are touched only through the interface contract.
2. Stack
Concern Choice
Framework Next.js (App Router), React Server Components,
Server Actions
Language TypeScript, strict mode
Styling Tailwind CSS
Database Neon PostgreSQL (pooled WebSocket driver for
transactions, HTTP driver for simple reads)
ORM and migrations Drizzle ORM and drizzle-kit
Validation Zod
Auth Auth.js (owned by Member 7); this module uses
getCurrentUser and requireRole
File storage Vercel Blob, client uploads with server-issued
tokens
Markdown react-markdown with rehype-sanitize
Page 1 of 13
--- PAGE 2 ---

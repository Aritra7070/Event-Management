# Eventora — event platform login starter

Premium Next.js + TypeScript + Tailwind authentication UI with animated Three.js art, Google OAuth, email OTP verification, Neon Postgres registration, and an event-announcement email API. The dashboard is intentionally a placeholder.

## Setup
1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` (PowerShell: `Copy-Item .env.example .env.local`).
4. Configure Google OAuth in Google Cloud Console. Authorized origin: `http://localhost:3000`; redirect URI: `http://localhost:3000/api/auth/callback/google`. Put credentials in `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
5. Create a Neon database through Vercel Marketplace and run `db/schema.sql` in its SQL editor. Put its connection string in `DATABASE_URL`.
6. Configure SMTP. Resend example: host `smtp.resend.com`, port `465`, secure `true`, user `resend`, password your API key. `MAIL_FROM` must be a sender/domain accepted by your provider.
7. Run `npm run dev`, open `http://localhost:3000`.

## Flow
Google sign-in → OTP sent to the Google account email → enter 6-digit code → member row is marked verified → `/dashboard`. OTP expires after 10 minutes and allows up to five attempts. OTPs are SHA-256 hashed before storage.

## Send event announcements to all verified members
POST `/api/events/announce` with `x-event-admin-key: <EVENT_ADMIN_API_KEY>` and JSON:
`{"title":"Tech Summit","date":"2026-11-20 10:00 IST","venue":"Kolkata","description":"Talks and networking","url":"https://example.com/event"}`
The API sends to each verified member and returns sent/failed counts. For production, add role-based admin access, rate limiting, queue-based batches, retries, unsubscribe preferences, and audit logs.

## Where to build the future dashboard
Edit `src/app/dashboard/page.tsx`. The verified flow redirects there automatically. Login UI is in `src/components/LoginExperience.tsx`; OTP UI is in `src/components/VerifyEmailForm.tsx`; email logic is in `src/lib/mail.ts`; database access is in `src/lib/db.ts`.

## Production notes
Never commit `.env.local`. Use a strong `AUTH_SECRET`, configure production Google callback URL, verify sender DNS (SPF/DKIM), and test delivery. Google OAuth itself is an identity-provider sign-in; this project adds a separate OTP step as requested.

import { Ticket } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Ticket className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight text-slate-900">
              EventSphere
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-sm font-medium">
            <Link
              href="/events"
              className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Events
            </Link>
            <Link
              href="/dashboard/events"
              aria-label="Organizer dashboard"
              className="rounded-lg bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-700"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="font-medium text-slate-600">EventSphere</p>
          <p>Find your next event.</p>
        </div>
      </footer>
    </div>
  );
}

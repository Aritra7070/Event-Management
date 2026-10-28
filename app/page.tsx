import {
  ArrowRight,
  CalendarDays,
  Globe2,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: Layers,
    title: "Section-based builder",
    description:
      "Edit basics, dates, capacity, hosts, images and questions without losing context.",
  },
  {
    icon: Globe2,
    title: "Public event pages",
    description:
      "SEO-ready pages with Open Graph cards, timezone-aware dates and strict draft visibility.",
  },
  {
    icon: ShieldCheck,
    title: "Safe lifecycle",
    description:
      "Draft, publish, unpublish and archive. Hidden events stay hidden, including metadata.",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-64 right-0 h-[420px] w-[520px] rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
              <Ticket className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              EventSphere
            </span>
          </Link>

          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link
              href="/dashboard/events"
              className="rounded-lg px-3 py-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/admin"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-200 transition hover:border-white/20 hover:bg-white/10"
            >
              Admin
            </Link>
          </nav>
        </header>

        <main>
          <section className="mx-auto grid w-full max-w-6xl gap-14 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-28 lg:pt-16 lg:px-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-200">
                <Sparkles className="h-3.5 w-3.5" />
                Event management, simplified
              </span>

              <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Create events people{" "}
                <span className="text-indigo-400">remember.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                EventSphere gives organizers a page builder, publish controls
                and a polished public experience — all in one place. Draft in
                private, publish when you are ready, and keep every detail in
                sync.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400"
                >
                  Browse events
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/events"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:bg-white/10"
                >
                  Organizer dashboard
                </Link>
              </div>

              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6 text-sm">
                <div>
                  <dt className="font-semibold text-white">Build</dt>
                  <dd className="mt-1 text-xs leading-5 text-slate-400">
                    Section by section
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Publish</dt>
                  <dd className="mt-1 text-xs leading-5 text-slate-400">
                    Validated and safe
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Share</dt>
                  <dd className="mt-1 text-xs leading-5 text-slate-400">
                    One public link
                  </dd>
                </div>
              </dl>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute -inset-4 rounded-[2rem] bg-indigo-500/10 blur-2xl" />

              <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl backdrop-blur">
                <div className="rounded-2xl bg-white p-2 shadow-xl">
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-violet-600 to-slate-900 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ring-white/20">
                        In person
                      </span>
                      <span className="text-[11px] font-medium text-indigo-100">
                        Preview
                      </span>
                    </div>

                    <p className="mt-14 text-2xl font-semibold tracking-tight">
                      React India Meetup
                    </p>

                    <p className="mt-2 flex items-center gap-1.5 text-xs text-indigo-100">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Sat, Mar 14, 2026 · 3:30 PM
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-indigo-100">
                      <MapPin className="h-3.5 w-3.5" />
                      Bengaluru, India
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-[10px] font-semibold">
                          AG
                        </span>
                        <span className="text-[11px] text-indigo-100">
                          Aritra Giri
                        </span>
                      </div>
                      <span className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-900">
                        Register
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 p-4">
                    <div className="h-2 w-16 rounded-full bg-slate-200" />
                    <div className="h-2 w-full rounded-full bg-slate-100" />
                    <div className="h-2 w-4/5 rounded-full bg-slate-100" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-6 w-20 rounded-md bg-slate-100" />
                      <div className="h-6 w-16 rounded-md bg-slate-100" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-400/20">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="mt-4 text-sm font-semibold text-white">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="border-t border-white/10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p className="font-medium text-slate-400">EventSphere</p>
            <p>Member 4 · Events module</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

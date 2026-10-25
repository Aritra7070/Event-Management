
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  Users,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";

const navigation: {
  label: string;
  href: string;
  icon: LucideIcon;
}[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Organizers", href: "/admin/organizers", icon: UserRoundCheck },
  { label: "Events", href: "/admin/events", icon: CalendarDays },
  { label: "Moderation", href: "/admin/moderation", icon: ShieldCheck },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const metrics = [
  {
    label: "Total users",
    value: "—",
    note: "Waiting for database connection",
    icon: Users,
    color: "text-blue-600",
    background: "bg-blue-50",
  },
  {
    label: "Organizers",
    value: "—",
    note: "Waiting for database connection",
    icon: UserRoundCheck,
    color: "text-violet-600",
    background: "bg-violet-50",
  },
  {
    label: "Total events",
    value: "—",
    note: "Waiting for database connection",
    icon: CalendarDays,
    color: "text-emerald-600",
    background: "bg-emerald-50",
  },
  {
    label: "Flagged items",
    value: "—",
    note: "Waiting for moderation data",
    icon: CircleAlert,
    color: "text-amber-600",
    background: "bg-amber-50",
  },
];

const quickLinks = [
  {
    title: "Manage users",
    description: "Review accounts, roles and account status.",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Review events",
    description: "View and manage events across the platform.",
    href: "/admin/events",
    icon: CalendarDays,
  },
  {
    title: "Moderation queue",
    description: "Review flagged content and moderation actions.",
    href: "/admin/moderation",
    icon: ShieldCheck,
  },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight">
              EventFlow
            </p>
            <p className="text-xs text-slate-500">Platform management</p>
          </div>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Administration
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/admin";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                  {active && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-indigo-600" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-slate-900 p-4 text-white">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck size={19} />
              <span className="text-sm font-semibold">Admin workspace</span>
            </div>
            <p className="text-xs leading-5 text-slate-300">
              Manage platform activity, users and event moderation from one
              place.
            </p>
            <p className="mt-3 border-t border-white/10 pt-3 text-xs text-slate-400">
              Event Management Platform
            </p>
          </div>
        </div>
      </aside>

      <main className="min-h-screen md:ml-64">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Administration / Overview
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 sm:flex">
              <Search size={16} />
              <span>Platform overview</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              RK
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
          <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="mb-2 text-sm font-medium text-indigo-100">
                  HACKERSPACE · EVENT MANAGEMENT
                </p>
                <h2 className="text-2xl font-bold sm:text-3xl">
                  Welcome to your workspace
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
                  Monitor platform activity and manage users, organizers,
                  events and moderation from one dashboard.
                </p>
              </div>
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                <LayoutDashboard size={32} />
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Platform overview</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Summary metrics will appear when the admin services are
                  connected.
                </p>
              </div>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                Setup in progress
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => {
                const Icon = metric.icon;

                return (
                  <article
                    key={metric.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {metric.label}
                        </p>
                        <p className="mt-3 text-3xl font-bold tracking-tight">
                          {metric.value}
                        </p>
                      </div>
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${metric.background} ${metric.color}`}
                      >
                        <Icon size={21} />
                      </div>
                    </div>
                    <p className="mt-4 text-xs leading-5 text-slate-500">
                      {metric.note}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold">Quick actions</h2>
              <p className="mt-1 text-sm text-slate-500">
                Navigate to the main administration tasks.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {quickLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Icon size={21} />
                      </div>
                      <ChevronRight
                        size={19}
                        className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600"
                      />
                    </div>
                    <h3 className="mt-4 font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <ClipboardList size={21} />
              </div>
              <div>
                <h2 className="font-semibold">Development checklist</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  The dashboard interface is the first milestone. Database
                  metrics, role-based access, moderation actions and audit
                  logging still need to be implemented and tested.
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Dashboard interface created
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Database and authentication integration pending
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Admin permissions and audit trail pending
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-500 sm:flex-row">
            <p>Event Management Platform · Admin workspace</p>
            <p>Member 6 · Rajashree Kar</p>
          </footer>
        </div>
      </main>
    </div>
  );
}


import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  ShieldCheck,
  Bell,
  Database,
} from "lucide-react";

const settingGroups = [
  {
    title: "Platform configuration",
    description:
      "Manage platform-wide options and event publishing rules.",
    icon: Settings,
  },
  {
    title: "Security and permissions",
    description:
      "Review administrator access and security policies.",
    icon: ShieldCheck,
  },
  {
    title: "Notifications",
    description:
      "Configure notifications for platform events and moderation.",
    icon: Bell,
  },
  {
    title: "Database and audit",
    description:
      "Review data configuration and administrator activity records.",
    icon: Database,
  },
];

export default function AdminSettingsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <p className="mb-2 text-sm font-medium text-indigo-600">
          Administration
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Platform Settings
        </h1>
        <p className="mt-2 text-slate-600">
          Review platform configuration and administrative controls.
        </p>

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Settings are not connected yet. These options are informational;
          no platform configuration will be changed.
        </div>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          {settingGroups.map((group) => {
            const Icon = group.icon;

            return (
              <div
                key={group.title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                  <Icon size={22} className="text-indigo-600" />
                </div>
                <h2 className="font-semibold">{group.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {group.description}
                </p>
                <p className="mt-4 text-xs font-medium text-amber-700">
                  Configuration pending
                </p>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}

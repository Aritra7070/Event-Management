"use client";

import * as Switch from "@radix-ui/react-switch";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  addHostAction,
  removeHostAction,
  updateHostCanScanAction,
} from "@/app/dashboard/events/actions";
import type { EventHostWithEmail } from "@/lib/types";
import { SectionCard } from "./SectionCard";

interface HostsSectionProps {
  eventId: string;
  hosts: EventHostWithEmail[];
  onSave?: () => void;
}

export function HostsSection({
  eventId,
  hosts: initialHosts,
  onSave,
}: HostsSectionProps) {
  const router = useRouter();
  const [hosts, setHosts] = useState(initialHosts);
  const [email, setEmail] = useState("");
  const [canScan, setCanScan] = useState(false);
  const [pending, setPending] = useState(false);
  const [pendingHostId, setPendingHostId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setHosts(initialHosts);
  }, [initialHosts]);

  async function add() {
    setError(null);
    setSuccess(null);
    const normalized = email.trim().toLowerCase();

    if (!normalized) {
      setError("Enter the co-host's email address.");
      return;
    }

    setPending(true);
    try {
      const result = await addHostAction(eventId, normalized, canScan);
      if (!result.success) {
        setError(result.message ?? result.error);
        return;
      }

      setEmail("");
      setCanScan(false);
      setSuccess("Co-host added.");
      onSave?.();
      router.refresh();
    } catch {
      setError("Could not add the co-host. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function remove(userId: string) {
    setError(null);
    setSuccess(null);
    setPendingHostId(userId);
    try {
      const result = await removeHostAction(eventId, userId);
      if (!result.success) {
        setError(result.message ?? result.error);
        return;
      }

      setHosts((current) => current.filter((host) => host.userId !== userId));
      setSuccess("Co-host removed.");
      onSave?.();
      router.refresh();
    } catch {
      setError("Could not remove the co-host. Please try again.");
    } finally {
      setPendingHostId(null);
    }
  }

  async function toggleScan(userId: string, nextValue: boolean) {
    setError(null);
    setSuccess(null);
    setPendingHostId(userId);
    try {
      const result = await updateHostCanScanAction(
        eventId,
        userId,
        nextValue,
      );
      if (!result.success) {
        setError(result.message ?? result.error);
        return;
      }

      setHosts((current) =>
        current.map((host) =>
          host.userId === userId ? { ...host, canScan: nextValue } : host,
        ),
      );
      setSuccess("Scan permission updated.");
      onSave?.();
      router.refresh();
    } catch {
      setError("Could not update scan permission. Please try again.");
    } finally {
      setPendingHostId(null);
    }
  }

  return (
    <SectionCard
      title="Co-hosts"
      description="Co-hosts can edit this event. Enable scanner access only for people checking attendees in."
    >
      <div className="space-y-3">
        <div>
          <label
            htmlFor="host-email"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Add a co-host by email
          </label>
          <div className="flex gap-2">
            <input
              id="host-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void add();
                }
              }}
              aria-label="Co-host email address"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              placeholder="cohost@example.com"
            />
            <button
              type="button"
              onClick={() => void add()}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={canScan}
            onChange={(event) => setCanScan(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
          />
          Allow this co-host to scan attendees at check-in
        </label>
      </div>

      <div className="mt-5">
        {hosts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            No co-hosts yet. You are the only organizer.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {hosts.map((host) => (
              <li
                key={host.userId}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {host.email ?? "Host"}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {host.userId}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <Switch.Root
                      checked={host.canScan}
                      onCheckedChange={(value) =>
                        void toggleScan(host.userId, value)
                      }
                      disabled={pendingHostId === host.userId}
                      aria-label={`Allow ${host.email ?? "this host"} to scan attendees`}
                      className="relative h-5 w-9 rounded-full bg-slate-300 transition data-[state=checked]:bg-indigo-600"
                    >
                      <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow transition data-[state=checked]:translate-x-[18px]" />
                    </Switch.Root>
                    Can scan
                  </label>

                  <button
                    type="button"
                    onClick={() => void remove(host.userId)}
                    disabled={pendingHostId === host.userId}
                    aria-label={`Remove ${host.email ?? "co-host"}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {pendingHostId === host.userId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 min-h-5 text-sm" aria-live="polite">
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : success ? (
          <p className="text-emerald-600">{success}</p>
        ) : null}
      </div>
    </SectionCard>
  );
}

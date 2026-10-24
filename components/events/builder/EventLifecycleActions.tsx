"use client";

import { Archive, EyeOff, Loader2, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  archiveAction,
  deleteEventAction,
  publishAction,
  unpublishAction,
} from "@/app/dashboard/events/actions";
import type { EventStatus } from "@/lib/types";

interface EventLifecycleActionsProps {
  eventId: string;
  status: EventStatus;
}

type PendingAction = "publish" | "unpublish" | "archive" | "delete" | null;

export function EventLifecycleActions({
  eventId,
  status,
}: EventLifecycleActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: Exclude<PendingAction, null>) {
    setError(null);

    if (action === "archive") {
      const confirmed = window.confirm(
        "Archive this event? It will be hidden from the public calendar.",
      );
      if (!confirmed) {
        return;
      }
    }

    if (action === "delete") {
      const confirmed = window.confirm(
        "Delete this draft permanently? This cannot be undone.",
      );
      if (!confirmed) {
        return;
      }
    }

    setPending(action);
    try {
      const result =
        action === "publish"
          ? await publishAction(eventId)
          : action === "unpublish"
            ? await unpublishAction(eventId)
            : action === "archive"
              ? await archiveAction(eventId)
              : await deleteEventAction(eventId);

      if (!result.success) {
        setError(result.message ?? result.error);
        return;
      }

      if (action === "delete") {
        router.push("/dashboard/events");
        return;
      }

      router.refresh();
    } catch {
      setError("That action could not be completed. Please try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {status === "draft" ? (
          <button
            type="button"
            onClick={() => void run("publish")}
            disabled={pending !== null}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending === "publish" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Publish
          </button>
        ) : null}

        {status === "published" ? (
          <button
            type="button"
            onClick={() => void run("unpublish")}
            disabled={pending !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
          >
            {pending === "unpublish" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
            Unpublish
          </button>
        ) : null}

        {status !== "archived" ? (
          <button
            type="button"
            onClick={() => void run("archive")}
            disabled={pending !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
          >
            {pending === "archive" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
            Archive
          </button>
        ) : null}

        {status === "draft" ? (
          <button
            type="button"
            onClick={() => void run("delete")}
            disabled={pending !== null}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {pending === "delete" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete draft
          </button>
        ) : null}

        {status === "archived" ? (
          <span className="text-xs text-slate-500">
            Archived — an admin can restore this event to draft.
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="max-w-sm text-right text-xs leading-5 text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

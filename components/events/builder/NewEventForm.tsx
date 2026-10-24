"use client";

import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createDraftAction } from "@/app/dashboard/events/actions";

export function NewEventForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Give your event a title to create the draft.");
      return;
    }

    setPending(true);
    try {
      const result = await createDraftAction({ title: title.trim() });
      if (!result.success) {
        setError(result.message ?? result.error);
        return;
      }
      router.push(`/dashboard/events/${result.data.id}/edit`);
    } catch {
      setError("Could not create the event. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="new-event-title"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Event title
        </label>
        <input
          id="new-event-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          required
          autoFocus
          aria-label="New event title"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          placeholder="e.g. React India Meetup"
        />
        <p className="mt-2 text-xs leading-5 text-slate-500">
          This creates a private draft. You can change the title, add a cover,
          dates and questions before publishing.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {pending ? "Creating draft..." : "Create draft"}
      </button>
    </form>
  );
}

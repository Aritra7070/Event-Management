"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";
import { updateEventAction } from "@/app/dashboard/events/actions";
import { MarkdownRenderer } from "@/components/events/MarkdownRenderer";
import type { ActionResult } from "@/lib/types";
import { SectionActions, SectionCard } from "./SectionCard";

interface BasicsSectionProps {
  eventId: string;
  title: string;
  descriptionMd: string;
  onSave?: (patch: {
    title: string;
    descriptionMd: string;
  }) => Promise<ActionResult<undefined>>;
}

export function BasicsSection({
  eventId,
  title: initialTitle,
  descriptionMd: initialDescriptionMd,
  onSave,
}: BasicsSectionProps) {
  const [title, setTitle] = useState(initialTitle);
  const [descriptionMd, setDescriptionMd] = useState(initialDescriptionMd);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function save() {
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError("Event title is required.");
      return;
    }

    setPending(true);
    try {
      const action = onSave ?? ((patch) => updateEventAction(eventId, patch));
      const result = await action({ title, descriptionMd });
      if (!result.success) {
        setError(result.message ?? result.error);
        return;
      }
      setSuccess("Saved");
    } catch {
      setError("Could not save this section. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <SectionCard
      title="Basics"
      description="The title and story attendees see first. Markdown is supported."
    >
      <div className="space-y-5">
        <div>
          <label
            htmlFor="event-title"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Event title
          </label>
          <input
            id="event-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            required
            aria-label="Event title"
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            placeholder="e.g. React India Meetup"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              Description
            </span>
            <span className="text-xs text-slate-400">Markdown</span>
          </div>

          <Tabs.Root defaultValue="write">
            <Tabs.List className="mb-3 inline-flex rounded-lg bg-slate-100 p-1">
              <Tabs.Trigger
                value="write"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                Write
              </Tabs.Trigger>
              <Tabs.Trigger
                value="preview"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                Preview
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="write">
              <textarea
                value={descriptionMd}
                onChange={(event) => setDescriptionMd(event.target.value)}
                rows={10}
                maxLength={50_000}
                aria-label="Event description in Markdown"
                className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 font-mono text-sm leading-6 text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                placeholder={"## About\n\nTell attendees what to expect..."}
              />
            </Tabs.Content>

            <Tabs.Content value="preview">
              <div className="min-h-56 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <MarkdownRenderer content={descriptionMd} />
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>

      <SectionActions
        pending={pending}
        error={error}
        success={success}
        onSave={save}
        saveLabel="Save basics"
      />
    </SectionCard>
  );
}

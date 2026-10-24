"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { updateEventAction } from "@/app/dashboard/events/actions";
import type { ActionResult } from "@/lib/types";
import { SectionActions, SectionCard } from "./SectionCard";

interface AccentColorPickerProps {
  eventId: string;
  currentColor: string | null;
  onSave?: (patch: { accentColor: string }) => Promise<ActionResult<undefined>>;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

function contrastWithWhite(hex: string): number {
  const channels = [1, 3, 5].map((offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });

  const luminance =
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return 1.05 / (luminance + 0.05);
}

export function AccentColorPicker({
  eventId,
  currentColor,
  onSave,
}: AccentColorPickerProps) {
  const [color, setColor] = useState(currentColor ?? "#2563eb");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const valid = HEX.test(color);
  const contrast = valid ? contrastWithWhite(color) : 0;
  const lowContrast = valid && contrast < 4.5;

  async function save() {
    setError(null);
    setSuccess(null);

    if (!HEX.test(color)) {
      setError("Use a 6-digit hex colour such as #2563eb.");
      return;
    }

    setPending(true);
    try {
      const action =
        onSave ??
        ((patch) => updateEventAction(eventId, patch));
      const result = await action({ accentColor: color.toLowerCase() });
      if (!result.success) {
        setError(result.message ?? result.error);
        return;
      }
      setSuccess("Saved");
    } catch {
      setError("Could not save the accent colour. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <SectionCard
      title="Accent colour"
      description="Used for buttons, links and highlights on the public event page."
    >
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={valid ? color : "#2563eb"}
          onChange={(event) => setColor(event.target.value)}
          aria-label="Pick accent colour"
          className="h-11 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
        />
        <input
          type="text"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          maxLength={7}
          aria-label="Accent colour hex value"
          className="w-32 rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-mono text-sm uppercase text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          placeholder="#2563eb"
        />
        <div
          className="flex h-10 flex-1 items-center justify-center rounded-lg text-sm font-semibold text-white shadow-sm"
          style={{ backgroundColor: valid ? color : "#2563eb" }}
        >
          Preview
        </div>
      </div>

      {!valid ? (
        <p className="mt-3 text-xs text-red-600">
          Use a 6-digit hex colour such as #2563eb.
        </p>
      ) : null}

      {lowContrast ? (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          This colour has a low contrast ratio with white text (
          {contrast.toFixed(1)}:1). Choose a darker shade for readable buttons.
        </p>
      ) : null}

      <SectionActions
        pending={pending}
        error={error}
        success={success}
        onSave={save}
        saveLabel="Save colour"
        disabled={!valid}
      />
    </SectionCard>
  );
}

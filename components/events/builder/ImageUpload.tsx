"use client";

import { upload } from "@vercel/blob/client";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { updateEventAction } from "@/app/dashboard/events/actions";
import { SectionCard } from "./SectionCard";

interface ImageUploadProps {
  eventId: string;
  currentUrl: string | null;
  field: "cover" | "logo";
  onUploaded?: (url: string) => void;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 4 * 1024 * 1024;

export function ImageUpload({
  eventId,
  currentUrl,
  field,
  onUploaded,
}: ImageUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(currentUrl);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setUrl(currentUrl);
  }, [currentUrl]);

  const label = field === "cover" ? "Cover image" : "Logo";
  const description =
    field === "cover"
      ? "A 16:9 image shown at the top of the event page and calendar card."
      : "A square logo shown beside the event title.";

  async function handleFile(file: File) {
    setError(null);
    setSuccess(null);

    if (!ACCEPTED.includes(file.type)) {
      setError("Use a JPEG, PNG or WebP image.");
      return;
    }

    if (file.size > MAX_BYTES) {
      setError("Images must be 4 MB or smaller.");
      return;
    }

    setPending(true);
    setProgress(0);

    try {
      const blob = await upload(
        `events/${eventId}/${field}-${Date.now()}-${file.name}`,
        file,
        {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
          clientPayload: JSON.stringify({ eventId }),
          onUploadProgress: ({ percentage }) => setProgress(percentage),
        },
      );

      setUrl(blob.url);
      setSuccess("Uploaded");

      if (onUploaded) {
        onUploaded(blob.url);
      } else {
        const patch =
          field === "cover"
            ? { coverUrl: blob.url }
            : { logoUrl: blob.url };
        const result = await updateEventAction(eventId, patch);
        if (!result.success) {
          setError(result.message ?? result.error);
          return;
        }
      }

      setProgress(100);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Image upload failed. Please try again.",
      );
    } finally {
      setPending(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function remove() {
    setError(null);
    setSuccess(null);
    setPending(true);

    try {
      if (onUploaded) {
        onUploaded("");
        setUrl(null);
        return;
      }

      const result = await updateEventAction(
        eventId,
        field === "cover" ? { coverUrl: null } : { logoUrl: null },
      );
      if (!result.success) {
        setError(result.message ?? result.error);
        return;
      }

      setUrl(null);
      setSuccess("Removed");
    } catch {
      setError("Could not remove the image. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <SectionCard title={label} description={description}>
      {url ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <Image
            src={url}
            alt={`${label} preview`}
            width={field === "cover" ? 800 : 240}
            height={field === "cover" ? 450 : 240}
            className={
              field === "cover"
                ? "aspect-video w-full object-cover"
                : "h-40 w-40 object-contain"
            }
          />
          <button
            type="button"
            onClick={() => void remove()}
            disabled={pending}
            aria-label={`Remove ${label.toLowerCase()}`}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-600 shadow-sm transition hover:bg-white hover:text-red-600 disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
          <ImageIcon className="h-7 w-7 text-slate-400" />
          <p className="mt-2 text-sm font-medium text-slate-700">
            No {label.toLowerCase()} yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            JPEG, PNG or WebP · up to 4 MB
          </p>
        </div>
      )}

      <div className="mt-4">
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {pending ? "Uploading..." : url ? "Replace image" : "Upload image"}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPTED.join(",")}
          disabled={pending}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleFile(file);
            }
          }}
          className="sr-only"
        />
        {pending ? (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-[width]"
              style={{ width: `${Math.max(5, progress)}%` }}
            />
          </div>
        ) : null}
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

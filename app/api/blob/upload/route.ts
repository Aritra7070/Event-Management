import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-stubs";
import { canManageEvent } from "@/lib/services/events";

/**
 * Issues short-lived client-upload tokens for Vercel Blob.
 *
 * The browser uploads directly to Blob; the file never passes through the
 * Next.js server. We still verify that the signed-in organizer can manage the
 * event encoded in `clientPayload` before issuing a token.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const user = await requireRole(["organizer", "admin"]);

        let payload: { eventId?: string } = {};
        try {
          payload = clientPayload ? JSON.parse(clientPayload) : {};
        } catch {
          throw new Error("Invalid upload payload.");
        }

        if (!payload.eventId) {
          throw new Error("Missing event id.");
        }

        if (!(await canManageEvent(user.id, payload.eventId))) {
          throw new Error("You cannot upload images for this event.");
        }

        if (!pathname.startsWith(`events/${payload.eventId}/`)) {
          throw new Error("Invalid upload path.");
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 4 * 1024 * 1024,
          tokenPayload: JSON.stringify({
            userId: user.id,
            eventId: payload.eventId,
          }),
        };
      },
      onUploadCompleted: async () => {
        // Intentionally empty. The client calls updateEventAction after the
        // upload resolves, which persists the returned Blob URL.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Image upload failed.",
      },
      { status: 400 },
    );
  }
}

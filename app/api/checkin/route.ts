import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth-stubs";
import {
  checkInByToken,
  checkInManually,
} from "@/lib/services/checkin";
import {
  checkInByTokenSchema,
  manualCheckInSchema,
} from "@/lib/validators/checkin";

const ERROR_STATUS: Record<string, number> = {
  invalid_input: 400,
  invalid_token: 400,
  not_found: 404,
  not_confirmed: 409,
  already_checked_in: 409,
  forbidden: 403,
  internal_error: 500,
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.status !== "active") {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "invalid_input" },
        { status: 400 },
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { ok: false, error: "invalid_input" },
        { status: 400 },
      );
    }

    const input = body as Record<string, unknown>;

    if ("token" in input) {
      const parsed = checkInByTokenSchema.safeParse(input);

      if (!parsed.success) {
        return NextResponse.json(
          { ok: false, error: "invalid_input" },
          { status: 400 },
        );
      }

      const result = await checkInByToken(
        parsed.data.token,
        parsed.data.eventId,
        user.id,
      );

      if (!result.ok) {
        return NextResponse.json(
          { ok: false, error: result.error },
          { status: ERROR_STATUS[result.error] ?? 500 },
        );
      }

      return NextResponse.json({ ok: true, data: result.data });
    }

    const parsed = manualCheckInSchema.safeParse(input);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "invalid_input" },
        { status: 400 },
      );
    }

    const result = await checkInManually(
      parsed.data.registrationId,
      user.id,
    );

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: ERROR_STATUS[result.error] ?? 500 },
      );
    }

    return NextResponse.json({ ok: true, data: result.data });
  } catch {
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 },
    );
  }
}
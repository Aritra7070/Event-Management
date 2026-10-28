
import { NextResponse } from "next/server";
import { createHash, randomInt } from "node:crypto";
import { auth } from "@/auth";
import { ensureDb, sql } from "@/lib/db";
import { sendOtp } from "@/lib/mail";

export const runtime = "nodejs";

export async function POST() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      { error: "Sign in with Google first." },
      { status: 401 },
    );
  }

  try {
    ensureDb();

    if (!process.env.AUTH_SECRET) {
      throw new Error("AUTH_SECRET is missing.");
    }

    const members = await sql`
      SELECT verified
      FROM members
      WHERE email = ${email}
      LIMIT 1
    `;

    if (members[0]?.verified) {
      return NextResponse.json({
        verified: true,
        message: "Email already verified.",
      });
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");

    const hash = createHash("sha256")
      .update(`${email}:${code}:${process.env.AUTH_SECRET}`)
      .digest("hex");

    await sql`
      INSERT INTO email_otps
        (email, otp_hash, expires_at, attempts, created_at)
      VALUES
        (
          ${email},
          ${hash},
          NOW() + INTERVAL '10 minutes',
          0,
          NOW()
        )
      ON CONFLICT (email)
      DO UPDATE SET
        otp_hash = ${hash},
        expires_at = NOW() + INTERVAL '10 minutes',
        attempts = 0,
        created_at = NOW()
    `;

    await sendOtp(email, code);

    return NextResponse.json({
      sent: true,
      message: "A 6-digit code was sent to your email.",
    });
  } catch (error) {
    console.error("OTP send failed:", error);

    return NextResponse.json(
      {
        error:
          "Could not send the verification code. Check Neon and SMTP configuration.",
      },
      { status: 500 },
    );
  }
}

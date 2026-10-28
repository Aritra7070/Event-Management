
import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { auth } from "@/auth";
import { ensureDb, sql } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      { error: "Sign in with Google first." },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "").trim();

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "Enter the 6-digit code." },
      { status: 400 },
    );
  }

  try {
    ensureDb();

    if (!process.env.AUTH_SECRET) {
      throw new Error("AUTH_SECRET is missing.");
    }

    const rows = await sql`
      SELECT otp_hash, expires_at, attempts
      FROM email_otps
      WHERE email = ${email}
      LIMIT 1
    `;

    const otp = rows[0];

    if (!otp) {
      return NextResponse.json(
        { error: "No active code. Request a new one." },
        { status: 400 },
      );
    }

    if (Number(otp.attempts) >= 5) {
      return NextResponse.json(
        { error: "Too many attempts. Request a new code." },
        { status: 429 },
      );
    }

    if (new Date(otp.expires_at).getTime() <= Date.now()) {
      await sql`
        DELETE FROM email_otps
        WHERE email = ${email}
      `;

      return NextResponse.json(
        { error: "Code expired. Request a new one." },
        { status: 400 },
      );
    }

    const hash = createHash("sha256")
      .update(`${email}:${code}:${process.env.AUTH_SECRET}`)
      .digest("hex");

    const storedHash = Buffer.from(String(otp.otp_hash), "hex");
    const suppliedHash = Buffer.from(hash, "hex");

    const valid =
      storedHash.length === suppliedHash.length &&
      timingSafeEqual(storedHash, suppliedHash);

    if (!valid) {
      await sql`
        UPDATE email_otps
        SET attempts = attempts + 1
        WHERE email = ${email}
      `;

      return NextResponse.json(
        { error: "Incorrect code." },
        { status: 400 },
      );
    }

    const user = session?.user;

    const id =
    (user as (typeof user & { id?: string }) | undefined)?.id ||
    email;

    await sql`
      INSERT INTO members
        (id, email, name, image, verified, created_at, verified_at)
      VALUES
        (
          ${id},
          ${email},
          ${user?.name ?? null},
          ${user?.image ?? null},
          TRUE,
          NOW(),
          NOW()
        )
      ON CONFLICT (email)
      DO UPDATE SET
        name = EXCLUDED.name,
        image = EXCLUDED.image,
        verified = TRUE,
        verified_at = NOW()
    `;

    await sql`
      DELETE FROM email_otps
      WHERE email = ${email}
    `;

    return NextResponse.json({
      verified: true,
      redirect: "/dashboard",
    });
  } catch (error) {
    console.error("OTP verification failed:", error);

    return NextResponse.json(
      { error: "Verification failed. Check database configuration." },
      { status: 500 },
    );
  }
}

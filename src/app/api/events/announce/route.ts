import { NextResponse } from "next/server";
import { sql, ensureDb } from "@/lib/db";
import { sendEvent } from "@/lib/mail";
import { z } from "zod";

export const runtime = "nodejs";

const Schema = z.object({
  title: z.string().min(2).max(160),
  date: z.string().min(2).max(100),
  venue: z.string().min(2).max(200),
  description: z.string().min(2).max(5000),
  url: z.string().url().max(1000),
});

export async function POST(req: Request) {
  if (
    !process.env.EVENT_ADMIN_API_KEY ||
    req.headers.get("x-event-admin-key") !==
      process.env.EVENT_ADMIN_API_KEY
  )
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );

  const p = Schema.safeParse(
    await req.json().catch(() => null)
  );

  if (!p.success)
    return NextResponse.json(
      { error: "Invalid event details.", details: p.error.flatten() },
      { status: 400 }
    );

  try {
    ensureDb();

    const members = await sql`
      SELECT email
      FROM members
      WHERE verified = TRUE
      ORDER BY email
    `;

    let sent = 0,
      failed = 0;

    for (const m of members) {
      try {
        await sendEvent(m.email, p.data);
        sent++;
      } catch (e) {
        console.error("Mail failed", m.email, e);
        failed++;
      }
    }

    await sql`
      INSERT INTO event_announcements(
        title,
        event_date,
        venue,
        description,
        event_url,
        sent_count
      )
      VALUES(
        ${p.data.title},
        ${p.data.date},
        ${p.data.venue},
        ${p.data.description},
        ${p.data.url},
        ${sent}
      )
    `;

    return NextResponse.json({
      ok: true,
      eligibleMembers: members.length,
      sent,
      failed,
    });
  } catch (e) {
    console.error(e);

    return NextResponse.json(
      { error: "Announcement failed. Check Neon and SMTP." },
      { status: 500 }
    );
  }
}
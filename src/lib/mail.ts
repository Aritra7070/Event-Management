import nodemailer from "nodemailer";

function tx() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASSWORD,
  } = process.env;

  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_USER ||
    !SMTP_PASSWORD
  )
    throw new Error("SMTP configuration missing.");

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });
}

const from =
  process.env.MAIL_FROM ||
  process.env.SMTP_USER ||
  "Eventora";

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c] || c)
  );

export async function sendOtp(
  to: string,
  code: string
) {
  await tx().sendMail({
    from,
    to,
    subject: `${code} is your Eventora verification code`,
    text: `Your Eventora code is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial;background:#10101a;color:#fff;padding:32px;border-radius:16px">
        <p style="color:#c4b5fd;letter-spacing:4px">EVENTORA</p>
        <h1>Verify your email</h1>
        <p>Enter this one-time code to finish creating your account.</p>
        <div style="font-size:36px;letter-spacing:12px;font-weight:bold;padding:20px;background:#201b31;border-radius:12px">
          ${code}
        </div>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
}

export async function sendEvent(
  to: string,
  e: {
    title: string;
    date: string;
    venue: string;
    description: string;
    url: string;
  }
) {
  await tx().sendMail({
    from,
    to,
    subject: `New event announced: ${e.title}`,
    text: `${e.title}
Date: ${e.date}
Venue: ${e.venue}

${e.description}

Details: ${e.url}`,
    html: `
      <div style="font-family:Arial;max-width:600px;margin:auto;color:#171725">
        <div style="background:#171323;color:#fff;padding:28px">
          <p>EVENTORA / EVENT UPDATE</p>
          <h1>${esc(e.title)}</h1>
        </div>
        <div style="padding:28px">
          <p><b>When:</b> ${esc(e.date)}</p>
          <p><b>Where:</b> ${esc(e.venue)}</p>
          <p>${esc(e.description)}</p>
          <p>
            <a href="${esc(e.url)}">View event details</a>
          </p>
        </div>
      </div>
    `,
  });
}
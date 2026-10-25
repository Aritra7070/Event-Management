import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function getSigningSecret(): string {
  const secret = process.env.QR_SIGNING_SECRET;

  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error(
      "QR_SIGNING_SECRET must be set and contain at least 32 bytes."
    );
  }

  return secret;
}

/**
 * Creates a unique ticket token.
 * The token contains a random ID and an HMAC-SHA256 signature.
 */
export function createTicketToken(): string {
  const ticketId = randomBytes(32).toString("base64url");
  const signature = createHmac("sha256", getSigningSecret())
    .update(ticketId)
    .digest("base64url");

  return `${ticketId}.${signature}`;
}

/**
 * Verifies a token's signature before any database lookup.
 * Returns the ticket ID if valid; otherwise returns null.
 */
export function verifyTicketToken(token: unknown): string | null {
  if (typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const [ticketId, suppliedSignature] = parts;

  // A 32-byte ID encoded as base64url is 43 characters.
  if (
    !/^[A-Za-z0-9_-]{43}$/.test(ticketId) ||
    !/^[A-Za-z0-9_-]{43}$/.test(suppliedSignature)
  ) {
    return null;
  }

  const expectedSignature = createHmac("sha256", getSigningSecret())
    .update(ticketId)
    .digest();

  let actualSignature: Buffer;

  try {
    actualSignature = Buffer.from(suppliedSignature, "base64url");
  } catch {
    return null;
  }

  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    return null;
  }

  return ticketId;
}
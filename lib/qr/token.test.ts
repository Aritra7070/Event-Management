import { beforeEach, describe, expect, it, vi } from "vitest";

vi.stubEnv(
  "QR_SIGNING_SECRET",
  "test-secret-for-qr-token-tests-1234567890"
);

import { createTicketToken, verifyTicketToken } from "./token";

describe("QR ticket tokens", () => {
  beforeEach(() => {
    vi.stubEnv(
      "QR_SIGNING_SECRET",
      "test-secret-for-qr-token-tests-1234567890"
    );
  });

  it("creates a token that can be verified", () => {
    const token = createTicketToken();

    expect(verifyTicketToken(token)).not.toBeNull();
  });

  it("creates unique tokens", () => {
    const firstToken = createTicketToken();
    const secondToken = createTicketToken();

    expect(firstToken).not.toBe(secondToken);
  });

  it("rejects a token with a modified signature", () => {
    const token = createTicketToken();
    const [ticketId, signature] = token.split(".");
    const replacement = signature[0] === "A" ? "B" : "A";
    const tamperedToken = `${ticketId}.${replacement}${signature.slice(1)}`;

    expect(verifyTicketToken(tamperedToken)).toBeNull();
  });

  it("rejects malformed tokens", () => {
    expect(verifyTicketToken("not-a-valid-token")).toBeNull();
    expect(verifyTicketToken("")).toBeNull();
    expect(verifyTicketToken(null)).toBeNull();
  });
});
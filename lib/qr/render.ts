import QRCode from "qrcode";

/**
 * Renders a signed ticket token as a QR code data URL.
 * The returned string can be used as an image's src.
 */
export async function renderTicketQr(token: string): Promise<string> {
  if (!token || typeof token !== "string") {
    throw new Error("A valid ticket token is required.");
  }

  return QRCode.toDataURL(token, {
    errorCorrectionLevel: "M",
    type: "image/png",
    margin: 2,
    width: 300,
  });
}
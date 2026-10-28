import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eventora — Gather around what matters",
  description: "A beautiful home for events, invitations and community.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
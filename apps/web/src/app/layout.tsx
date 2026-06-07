import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReviewQR AI",
  description: "AI-powered Google review generation and QR code review collection"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

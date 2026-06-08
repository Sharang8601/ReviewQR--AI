import type { Metadata } from "next";
import { ToastProvider } from "../components/Toast";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ReviewQR AI",
    template: "%s | ReviewQR AI"
  },
  description: "AI-powered Google review generation and QR code review collection for growing businesses.",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
    shortcut: "/logo.svg"
  },
  openGraph: {
    title: "ReviewQR AI",
    description: "Get more Google reviews with AI-powered QR codes and polished review suggestions.",
    type: "website",
    siteName: "ReviewQR AI",
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "ReviewQR AI — Get more Google reviews with AI"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ReviewQR AI",
    description: "Get more Google reviews with AI-powered QR codes and polished review suggestions.",
    images: ["/og-default.svg"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

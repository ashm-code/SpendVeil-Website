import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07111f",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: "SpendVeil — Private expense tracking for iPhone",
    description:
      "Explore SpendVeil’s interactive expense tracking demo: receipts, search, reports, recurring expenses, exports, and guarded on-device intelligence.",
    applicationName: "SpendVeil",
    keywords: ["expense tracker", "iPhone", "receipt scanner", "private finance", "budget app"],
    icons: {
      icon: "/app-icon.png",
      apple: "/app-icon.png",
    },
    openGraph: {
      type: "website",
      url: origin,
      title: "SpendVeil — Private spending clarity",
      description: "Track expenses and understand every month without linking a bank account.",
      siteName: "SpendVeil",
      images: [{ url: `${origin}/og.png`, width: 1536, height: 1024, alt: "SpendVeil private expense tracking for iPhone" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "SpendVeil — Private spending clarity",
      description: "Track expenses and understand every month without linking a bank account.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}

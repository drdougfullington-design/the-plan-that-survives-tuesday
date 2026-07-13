import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const socialImage = `${origin}/og.png`;
  return {
    metadataBase: new URL(origin),
    title: { default: "The Plan That Survives Tuesday", template: "%s · Tuesday" },
    description: "The doctor supplies clinical judgment. The patient supplies lived reality. AI helps the two occupy the same plan.",
    openGraph: {
      title: "The Plan That Survives Tuesday",
      description: "What if AI could make a medically sound plan survive contact with real life?",
      type: "website",
      images: [{ url: socialImage, width: 1731, height: 909, alt: "The Plan That Survives Tuesday — medically sound, built for real life" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "The Plan That Survives Tuesday",
      description: "I gave AI a medically perfect plan. Then I introduced it to Tuesday.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

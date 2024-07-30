import type { Metadata, Viewport } from "next";

import "~/app/globals.css";

import type { ReactNode } from "react";
import { AFACAD, PLAYFAIR } from "@/next.fonts";

import { cn } from "@acme/ui";

import { env } from "~/env.mjs";
import { AppProviders } from "../providers/app-providers";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://turbo.t3.gg"
      : "http://localhost:3000",
  ),
  title: "Create T3 Turbo",
  description: "Simple monorepo with shared backend for web & mobile apps",
  openGraph: {
    title: "Create T3 Turbo",
    description: "Simple monorepo with shared backend for web & mobile apps",
    url: "https://create-t3-turbo.vercel.app",
    siteName: "Create T3 Turbo",
  },
  twitter: {
    card: "summary_large_image",
    site: "@jullerino",
    creator: "@jullerino",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          AFACAD.variable,
          PLAYFAIR.variable,
        )}
      >
        <AppProviders>{props.children}</AppProviders>
      </body>
    </html>
  );
}

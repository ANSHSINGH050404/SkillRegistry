import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";

const terminalMono = JetBrains_Mono({
  variable: "--font-terminal",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Agent Skills Directory — Discover skills for your AI coding agent",
  description:
    "Search skills for Prisma, Drizzle, Better Auth, Next.js, Hono, Effect, PostgreSQL, MCP, Playwright and more.",
  openGraph: {
    title: "Agent Skills Directory",
    description: "Discover skills for your AI coding agent.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Agent Skills Directory" },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Agent Skills Directory",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  potentialAction: {
    "@type": "SearchAction",
    target: "/skills?q={query}",
    "query-input": "required name=query",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${terminalMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-mono">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <ThemeProvider>
          <PostHogProvider>
            <Navbar />
            <main className="mx-auto w-full max-w-[880px] flex-1 px-4 py-8 md:px-6">{children}</main>
            <Footer />
          </PostHogProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

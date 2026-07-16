import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthUIProvider } from "@/components/auth-ui-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const OG_DESCRIPTION =
  "A private AI career operating system for technical professionals. Honest fit calls, gaps named candidly, never an invented bullet point.";

export const metadata: Metadata = {
  metadataBase: new URL("https://switchback.careers"),
  title: {
    default: "Switchback",
    template: "%s · Switchback",
  },
  description:
    "Switchback — a private AI career operating system for technical professionals. Same mountain, higher ground.",
  openGraph: {
    title: "Switchback",
    description: OG_DESCRIPTION,
    url: "https://switchback.careers",
    siteName: "Switchback",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Switchback",
    description: OG_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthUIProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </AuthUIProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

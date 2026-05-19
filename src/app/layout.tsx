import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DRIP. — Wear the Culture",
    template: "%s | DRIP.",
  },
  description:
    "Premium streetwear & anime-inspired fashion for Gen-Z. Shop oversized tees, hoodies, joggers, and exclusive drops. Free shipping on orders above ₹999.",
  keywords: [
    "streetwear",
    "anime fashion",
    "oversized tees",
    "hoodies",
    "Gen-Z fashion",
    "DRIP store",
    "urban fashion",
    "D2C fashion",
  ],
  openGraph: {
    title: "DRIP. — Wear the Culture",
    description: "Premium streetwear & anime-inspired fashion for Gen-Z.",
    type: "website",
    locale: "en_IN",
    siteName: "DRIP.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DRIP. — Wear the Culture",
    description: "Premium streetwear & anime-inspired fashion for Gen-Z.",
  },
  robots: {
    index: true,
    follow: true,
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
      className={`${inter.variable} ${spaceGrotesk.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

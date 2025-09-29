import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sohbetle Tavsiye",
  description: "Türkçe, nazik ve güvenli ilişki önerileri",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-b from-indigo-50 to-pink-50 dark:from-gray-950 dark:to-gray-900`}
      >
        <header className="sticky top-0 z-10 backdrop-blur bg-white/50 dark:bg-black/30 border-b">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <h1 className="text-base font-semibold">Sohbetle Tavsiye</h1>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Empatik ve güvenli öneriler</span>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-5xl px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}

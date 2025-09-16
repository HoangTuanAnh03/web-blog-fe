import type React from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { ChatbotPopup } from "@/components/chatbot-popup";

import { Be_Vietnam_Pro, Literata } from "next/font/google"

// const beVietnam = Be_Vietnam_Pro({
//   subsets: ["latin", "latin-ext", "vietnamese"],
//   weight: ["400","500","600","700","800"],
//   variable: "--font-sans",
//   display: "swap",
// })

// const literata = Literata({
//   subsets: ["latin", "latin-ext", "vietnamese"],
//   weight: ["400","500","600","700","800"],
//   variable: "--font-serif",
//   display: "swap",
// })


const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-ui",
});

const literata = Literata({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-serif",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});
export const metadata: Metadata = {
  title: "Blog Platform",
  description: "A modern blog platform for sharing your ideas with the world",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} ${literata.variable} ${jetbrains.variable} theme-medium antialiased`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <Toaster />
            <ChatbotPopup />
            <footer className="border-t bg-muted py-4 text-center text-xs text-muted-foreground">
              © 2025 Blog Platform. All rights reserved.
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}

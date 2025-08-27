import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blog Platform",
  description: "A modern blog platform for sharing your ideas with the world",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <Toaster />
            <footer className="bg-muted py-4 text-center text-xs text-muted-foreground border-t">
              © 2025 Blog Platform. All rights reserved.
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}

import "./globals.css";

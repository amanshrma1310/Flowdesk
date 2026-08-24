import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FlowDeskStoreProvider } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowDesk AI — Role-Based Marketing Automation & Lead Management Platform",
  description: "Capture leads from anywhere, organize into folders, assign across team hierarchies, automate response-based WhatsApp & email workflows.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans overflow-hidden">
        <FlowDeskStoreProvider>
          <AppShell>{children}</AppShell>
        </FlowDeskStoreProvider>
      </body>
    </html>
  );
}

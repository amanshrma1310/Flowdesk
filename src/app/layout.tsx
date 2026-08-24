import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FlowDeskStoreProvider } from "@/lib/store";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowDesk AI — Import your data. Automate your work. Grow your business.",
  description: "AI-Powered Customer Automation Platform. Turn any data into clean customer profiles and automated WhatsApp, email, and sales workflows.",
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
          <div className="flex h-screen w-full overflow-hidden">
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto bg-slate-50/70 dark:bg-slate-950 p-6">
                {children}
              </main>
            </div>
          </div>
        </FlowDeskStoreProvider>
      </body>
    </html>
  );
}

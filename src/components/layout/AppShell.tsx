"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useFlowDesk } from "@/lib/store";
import { AdminOnboardingModal } from "@/components/auth/AdminOnboardingModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, organization } = useFlowDesk();

  // PUBLIC ROUTES: Public web forms and API endpoints must never be blocked by the admin login modal
  const isPublicRoute =
    pathname?.startsWith("/forms/public") ||
    pathname?.startsWith("/api");

  if (isPublicRoute) {
    return <main className="min-h-screen w-full bg-slate-950">{children}</main>;
  }

  // If no user is signed in or no agency exists, display the clean Sign In / Create Agency portal
  if (!currentUser || !organization) {
    return <AdminOnboardingModal />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar (Desktop + Mobile slide-over) */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 overflow-y-auto bg-slate-50/70 dark:bg-slate-950 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

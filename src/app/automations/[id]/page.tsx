"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutomationDetailRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/automations");
  }, [router]);
  return null;
}

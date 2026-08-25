"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutomationTemplatesRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/automations");
  }, [router]);
  return null;
}

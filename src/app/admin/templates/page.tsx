"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminTemplatesRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/templates");
  }, [router]);
  return null;
}

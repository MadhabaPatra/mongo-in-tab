"use client";

import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";

export function HeaderShell() {
  return (
    <Suspense fallback={<div className="h-14 border-b" />}>
      <AppHeader />
    </Suspense>
  );
}

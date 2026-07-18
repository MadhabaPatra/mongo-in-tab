"use client";

import { useEffect } from "react";
import { useHeaderContext } from "@/lib/header-context";
import type { ReactNode } from "react";

export function HeaderSlot({ children }: { children: ReactNode }) {
  const { setBreadcrumbEnd } = useHeaderContext();

  useEffect(() => {
    setBreadcrumbEnd(children);
    return () => setBreadcrumbEnd(null);
  }, [children, setBreadcrumbEnd]);

  return null;
}

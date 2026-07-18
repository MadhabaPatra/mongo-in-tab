"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface HeaderContextValue {
  breadcrumbEnd: ReactNode;
  setBreadcrumbEnd: (node: ReactNode) => void;
}

const HeaderContext = createContext<HeaderContextValue | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [breadcrumbEnd, setBreadcrumbEnd] = useState<ReactNode>(null);

  return (
    <HeaderContext.Provider value={{ breadcrumbEnd, setBreadcrumbEnd }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeaderContext() {
  const ctx = useContext(HeaderContext);
  if (!ctx) {
    throw new Error("useHeaderContext must be used within HeaderProvider");
  }
  return ctx;
}

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import type React from "react";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen">
      <Header />

      {children}
      <Footer />
    </main>
  );
}

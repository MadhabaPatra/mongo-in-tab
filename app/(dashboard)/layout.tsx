import { AppHeader } from "@/components/app-header";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      {children}
    </main>
  );
}

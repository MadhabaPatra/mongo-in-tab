import { HeaderProvider } from "@/lib/header-context";
import { HeaderShell } from "@/components/header-shell";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <HeaderProvider>
      <HeaderShell />
      <main className="min-h-screen bg-background">{children}</main>
    </HeaderProvider>
  );
}

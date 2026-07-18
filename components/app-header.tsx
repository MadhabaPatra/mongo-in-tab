"use client";

import Link from "next/link";
import {
  RefreshCw,
  LogOut,
  Server,
  Database,
  Table,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

import { StorageManager } from "@/lib/storage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHeaderContext } from "@/lib/header-context";

interface BreadcrumbItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function AppHeader() {
  const { breadcrumbEnd } = useHeaderContext();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const connectionId = searchParams.get("connectionId");
  const database = searchParams.get("database");
  const collectionName = searchParams.get("collectionName");

  const [currentConnection, setCurrentConnection] = useState<
    IConnection | undefined
  >(undefined);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleRefresh = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (connectionId) {
      setCurrentConnection(StorageManager.getConnectionDetails(connectionId));
    }
  }, [connectionId]);

  const type: "connection" | "database" | "collection" | "document" =
    pathname.includes("/documents")
      ? "document"
      : pathname.includes("/collections")
        ? "collection"
        : pathname.includes("/databases")
          ? "database"
          : "connection";

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: currentConnection?.name || "Connections",
        href:
          connectionId && currentConnection
            ? `/app/databases?connectionId=${connectionId}`
            : "/app",
        icon: <Server className="h-3.5 w-3.5" />,
      },
    ];

    if (connectionId && currentConnection) {
      if (type === "document") {
        breadcrumbs.push({
          label: database || "Databases",
          href: `/app/collections?connectionId=${connectionId}&database=${database}`,
          icon: <Database className="h-3.5 w-3.5" />,
        });
      }

      if (type === "collection" && database) {
        breadcrumbs.push({
          label: database,
          href: `/app/databases?connectionId=${connectionId}`,
          icon: <Database className="h-3.5 w-3.5" />,
        });
      }

      if (type === "document" && collectionName && !breadcrumbEnd) {
        breadcrumbs.push({
          label: collectionName,
          href: "#",
          icon: <FileText className="h-3.5 w-3.5" />,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Left — Logo + Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <Image
                src="/logo.png"
                width={28}
                height={28}
                alt="MongoInTab Logo"
                className="transition-transform group-hover:scale-105"
              />
              <span className="font-mono text-base font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent hidden sm:inline">
                MongoInTab
              </span>
            </Link>

            {/* Breadcrumbs */}
            {(breadcrumbs.length > 1 || (connectionId && currentConnection)) && (
              <>
                <div className="hidden sm:block h-5 w-px bg-border/60 shrink-0" />
                <nav
                  className="hidden sm:flex items-center gap-1 min-w-0"
                  aria-label="Breadcrumb"
                >
                  {breadcrumbs.map((item, index) => (
                    <div key={item.href} className="flex items-center shrink-0">
                      {index > 0 && (
                        <div className="mx-1 h-3.5 w-3.5 text-muted-foreground/40 shrink-0">
                          <svg
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="h-3.5 w-3.5"
                          >
                            <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06L7.28 12.78a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
                          </svg>
                        </div>
                      )}
                      {index < breadcrumbs.length - 1 ? (
                        <Link
                          href={item.href}
                          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors whitespace-nowrap"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      ) : breadcrumbEnd ? (
                        <div className="flex items-center">{breadcrumbEnd}</div>
                      ) : (
                        <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-foreground bg-muted/30 whitespace-nowrap">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </>
            )}
          </div>

          {/* Right — Connection Dropdown (hover) */}
          <div className="flex items-center shrink-0">
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger
                className="flex items-center gap-1.5 rounded-md bg-muted/30 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors outline-none cursor-default"
                onMouseEnter={() => setIsDropdownOpen(true)}
              >
                <div className="relative">
                  <Server className="h-3.5 w-3.5 text-primary" />
                  {currentConnection && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-green-500 border border-background" />
                  )}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate font-mono">
                  {currentConnection?.name || "Not connected"}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56"
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                {currentConnection ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-xs font-medium text-foreground">
                        {currentConnection.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate font-mono">
                        {currentConnection.url}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                <DropdownMenuItem
                  onClick={handleRefresh}
                  className="text-xs cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-2" />
                  Refresh page
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-xs cursor-pointer">
                  <Link href="/app">
                    <LogOut className="h-3.5 w-3.5 mr-2" />
                    Disconnect
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

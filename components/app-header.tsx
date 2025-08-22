"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Info,
  LogOut,
  RefreshCw,
  Server,
  Database,
  Table,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSearchParams } from "next/navigation";
import { StorageManager } from "@/lib/storage";
import Image from "next/image";

interface BreadcrumbItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function AppHeader({ type }: { type: string }) {
  const searchParams = useSearchParams();
  const connectionId = searchParams.get("connectionId");
  const database = searchParams.get("database");
  const collectionName = searchParams.get("collectionName");

  const [currentConnection, setCurrentConnection] = useState<
    IConnection | undefined
  >(undefined);

  const handleRefresh = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (connectionId) {
      setCurrentConnection(StorageManager.getConnectionDetails(connectionId));
    }
  }, [connectionId]);

  // Generate breadcrumbs based on current page type
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: "Connections",
        href: "/app",
        icon: <Server className="h-3.5 w-3.5" />,
      },
    ];

    if (connectionId && currentConnection) {
      if (type === "database" || type === "collection" || type === "document") {
        breadcrumbs.push({
          label: "Databases",
          href: `/app/databases?connectionId=${connectionId}`,
          icon: <Database className="h-3.5 w-3.5" />,
        });
      }

      if ((type === "collection" || type === "document") && database) {
        breadcrumbs.push({
          label: "Collections",
          href: `/app/collections?connectionId=${connectionId}&database=${database}`,
          icon: <Table className="h-3.5 w-3.5" />,
        });
      }

      if (type === "document" && collectionName) {
        breadcrumbs.push({
          label: "Documents",
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
        <div className="flex h-16 items-center justify-between">
          {/* Left Section - Logo and Navigation */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Image
                  src="/logo.png"
                  width={32}
                  height={32}
                  alt="MongoInTab Logo"
                  className="transition-transform group-hover:scale-105"
                />
              </div>
              <span className="font-mono text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                MongoInTab
              </span>
            </Link>

            {/* Breadcrumb Navigation */}
            {breadcrumbs.length > 1 && (
              <>
                <div className="hidden sm:block h-6 w-px bg-border/60" />
                <nav
                  className="hidden sm:flex items-center space-x-1"
                  aria-label="Breadcrumb"
                >
                  {breadcrumbs.map((item, index) => (
                    <div key={item.href} className="flex items-center">
                      {index > 0 && (
                        <div className="mx-2 h-4 w-4 text-muted-foreground/50">
                          <svg
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="h-4 w-4"
                          >
                            <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06L7.28 12.78a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
                          </svg>
                        </div>
                      )}
                      {index < breadcrumbs.length - 1 ? (
                        <Link
                          href={item.href}
                          className="flex items-center space-x-1.5 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      ) : (
                        <div className="flex items-center space-x-1.5 rounded-md px-2 py-1 text-sm font-medium text-foreground bg-muted/30">
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

          {/* Right Section - Connection Info and Actions */}
          <div className="flex items-center space-x-3">
            {/* Connection Info - Desktop */}
            {currentConnection && (
              <div className="hidden md:flex items-center space-x-3 rounded-md bg-muted/30 px-3 py-1.5 mr-2">
                <div className="relative">
                  <Server className="h-4 w-4 text-primary" />
                  <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 border border-background" />
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-mono font-medium text-foreground max-w-[120px] truncate">
                    {currentConnection.name}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <span>#{currentConnection.id}</span>
                        <Info className="h-3 w-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <div className="text-center space-y-1">
                        <p className="text-xs">
                          All data runs in your browser — nothing stored on
                          servers.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {breadcrumbs.length > 1 && (
              <Button variant="ghost" size="sm" asChild className="sm:hidden">
                <Link href={breadcrumbs[breadcrumbs.length - 2].href}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            )}

            {/* Action Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="hover:bg-primary/5 hover:border-primary/20"
            >
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="hover:bg-destructive/5 hover:border-destructive/20 hover:text-destructive"
            >
              <Link href="/app">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Disconnect</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile Connection Info */}
        {currentConnection && (
          <div className="lg:hidden border-t bg-muted/20 px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Server className="h-4 w-4 text-primary" />
                <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 border border-background" />
              </div>
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <span className="font-mono font-medium text-sm text-foreground truncate">
                  {currentConnection.name}
                </span>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <span>#{currentConnection.id}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="text-center space-y-1">
                        <p className="text-xs">
                          All data runs in your browser — nothing stored on
                          servers.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

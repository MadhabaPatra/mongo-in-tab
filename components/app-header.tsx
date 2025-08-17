"use client";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { ArrowLeft, Info, LogOut, RefreshCw, Server } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSearchParams } from "next/navigation";
import { StorageManager } from "@/lib/storage";

export function AppHeader({ type }: { type: string }) {
  const searchParams = useSearchParams();
  const connectionId = searchParams.get("connectionId");
  const database = searchParams.get("database");

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

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {type === "database" && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hover:bg-transparent hover:text-primary cursor-pointer"
              >
                <Link href="/app">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Connections
                </Link>
              </Button>
            )}

            {type === "collection" && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hover:bg-transparent hover:text-primary cursor-pointer"
              >
                <Link href={`/app/databases?connectionId=${connectionId}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Databases
                </Link>
              </Button>
            )}

            {type === "document" && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hover:bg-transparent hover:text-primary cursor-pointer"
              >
                <Link
                  href={`/app/collections?connectionId=${connectionId}&database=${database}`}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Collections
                </Link>
              </Button>
            )}

            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-primary" />
              <div className="flex flex-col gap-1">
                <p className="font-mono font-semibold text-base">
                  {currentConnection?.url}
                </p>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  Local storage #ID: {currentConnection?.id}
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-blue-600" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        All data runs in your browser — nothing is stored on our
                        servers.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hover:bg-transparent hover:text-primary cursor-pointer"
            >
              <Link href="/app">
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Link>
            </Button>
            <Button
              onClick={() => handleRefresh()}
              size="sm"
              className="cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 mr-2`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

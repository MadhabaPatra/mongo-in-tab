"use client";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { ArrowLeft, Info, LogOut, RefreshCw, Server } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AppHeader() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async (): Promise<void> => {};

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hover:bg-transparent hover:text-primary cursor-pointer"
            >
              <Link href="/databases">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Connections
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-primary" />
              <div className="flex flex-col gap-1">
                <p className="font-mono font-semibold text-base">
                  Mongo DB Connection
                </p>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  mongodb://cluster0.example.com:27017
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
              onClick={handleRefresh}
              disabled={isLoading}
              size="sm"
              className="cursor-pointer"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

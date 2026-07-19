"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Server,
  AlertCircle,
  Shield,
  Zap,
  RefreshCw,
  Trash2,
  Database,
} from "lucide-react";

import { ConnectionCard } from "@/components/connections/connection-card";
import { useRouter } from "next/navigation";
import { StorageManager } from "@/lib/storage";
import { testMongoConnection } from "@/lib/mongodb";
import { validateUrl } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AppPage() {
  const [mongoUrl, setMongoUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const router = useRouter();

  const [connections, setConnections] = useState<IConnection[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "single" | "all";
    id?: string;
  } | null>(null);

  useEffect(() => {
    setConnections(StorageManager.getConnections());
  }, []);

  const loadConnections = () => {
    setIsLoadingConnections(true);
    setConnections(StorageManager.getConnections());
    setIsLoadingConnections(false);
  };

  const handleConfirmDelete = () => {
    setDeleteConfirm(null);
    setIsLoadingConnections(true);

    if (deleteConfirm?.type === "all") {
      StorageManager.removeAllConnections();
      toast.success("All connections have been removed from the browser!");
    } else if (deleteConfirm?.type === "single" && deleteConfirm.id) {
      StorageManager.removeConnection(deleteConfirm.id);
      toast.success("Removed successfully from the browser!");
    }
    loadConnections();
    setIsLoadingConnections(false);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const clearConnections = () => {
    setDeleteConfirm({ type: "all" });
  };

  const clearConnectionById = (id: string) => {
    setDeleteConfirm({ type: "single", id });
  };

  const handleConnect = async () => {
    const error = validateUrl(mongoUrl);
    if (error) {
      setValidationError(error);
      return;
    }

    if (!mongoUrl.trim()) {
      setValidationError("Please enter a valid MongoDB connection string");
      return;
    }

    setIsConnecting(true);
    setValidationError("");
    try {
      const response = await testMongoConnection(mongoUrl);

      if (!response || typeof response !== "object") {
        setValidationError("Server returned an invalid response. Please try again.");
      } else if (!response.success) {
        setValidationError(response?.message || "Something went wrong");
      } else {
        const addedConnection = StorageManager.addConnection(mongoUrl);
        router.push("/app/databases?connectionId=" + addedConnection);
      }
    } catch {
      setValidationError("Something went wrong, Please try again later.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSampleConnection = async () => {
    setIsConnecting(true);
    setValidationError("");
    try {
      const sampleId = StorageManager.loadSampleConnection();
      router.push("/app/databases?connectionId=" + sampleId);
    } catch {
      setValidationError("Failed to load sample connection.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Connections
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your MongoDB connections. All data stays in your browser.
          </p>
        </div>

        {/* Connection Bar */}
        <div className="rounded-xl border bg-card p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:relative">
              <Input
                type="text"
                placeholder="mongodb://username:password@host:port/database"
                value={mongoUrl}
                onChange={(e) => {
                  setMongoUrl(e.target.value);
                  if (validationError) setValidationError("");
                }}
                className="h-10 sm:h-11 text-sm font-mono px-3 sm:px-4 sm:pr-[7.5rem] border-input focus-visible:ring-primary flex-1"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleConnect()}
              />
              <Button
                onClick={handleConnect}
                disabled={!mongoUrl.trim() || isConnecting}
                className="sm:absolute sm:right-1.5 sm:top-1.5 h-10 sm:h-8 px-4 bg-primary hover:bg-primary/90 w-full sm:w-auto text-sm"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Connecting…
                  </>
                ) : (
                  <>
                    <Server className="h-4 w-4 mr-2" />
                    Connect
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Stored locally in your browser</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSampleConnection}
                disabled={isConnecting}
                className="h-auto px-0 py-0 text-xs text-primary hover:text-primary hover:bg-transparent"
              >
                <Zap className="h-3 w-3 mr-1" />
                Try sample connection
              </Button>
            </div>

            {validationError && (
              <Alert
                variant="destructive"
                className="border-destructive/20 bg-destructive/5"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {validationError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Connections List Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-foreground">
              Connections
            </h2>
            {connections.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {connections.length}
              </span>
            )}
          </div>
          {connections.length > 0 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={loadConnections}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearConnections}
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Connections Grid */}
        {isLoadingConnections ? (
          <LoadingConnections />
        ) : connections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {[...connections]
              .sort((a, b) => {
                const aTime = a.lastUsed
                  ? new Date(a.lastUsed).getTime()
                  : 0;
                const bTime = b.lastUsed
                  ? new Date(b.lastUsed).getTime()
                  : 0;
                return bTime - aTime;
              })
              .map((connection) => (
                <ConnectionCard
                  connection={connection}
                  key={connection.id}
                  clearConnectionById={clearConnectionById}
                  onNameUpdated={loadConnections}
                />
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-12 sm:py-16 text-center">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-muted rounded-full flex items-center justify-center mb-3">
              <Database className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm sm:text-base font-medium text-foreground mb-1">
              No saved connections
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xs px-4 mb-4">
              Your connections will appear here after you connect to a database.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSampleConnection}
              disabled={isConnecting}
            >
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Try sample connection
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="mx-4 sm:mx-0 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {deleteConfirm?.type === "all"
                ? "Clear All Connections?"
                : "Delete Connection?"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {deleteConfirm?.type === "all"
                ? "This will remove all connections from your browser. This action cannot be undone."
                : "This will remove this connection. This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="w-full sm:w-auto"
            >
              {deleteConfirm?.type === "all" ? "Clear All" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Loading Skeletons
function LoadingConnections() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border bg-card p-3.5"
        >
          <Skeleton className="h-9 w-9 rounded-lg bg-muted" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-32 bg-muted rounded" />
            <Skeleton className="h-3 w-48 bg-muted rounded" />
          </div>
          <Skeleton className="h-7 w-16 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

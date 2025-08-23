"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Database,
  History,
  Trash2,
  Info,
  RefreshCw,
  AlertCircle,
  Plus,
  Shield,
  Server,
} from "lucide-react";

import { ConnectionCard } from "@/components/connections/connection-card";
import { useRouter } from "next/navigation";
import { StorageManager } from "@/lib/storage";
import { testMongoConnection } from "@/lib/mongodb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { AppHeader } from "@/components/app-header";

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
      toast.success("All connections have been removed from the browser!.");
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
    if (!!validationError || !mongoUrl.trim()) {
    } else {
      setIsConnecting(true);
      setValidationError("");
      try {
        const response = await testMongoConnection(mongoUrl);

        if (!response.success) {
          setValidationError(response?.message || "Something went wrong");
        } else {
          const addedConnection = StorageManager.addConnection(mongoUrl);
          router.push("/app/databases?connectionId=" + addedConnection);
        }
      } catch (e) {
        setValidationError("Something went wrong, Please try again later.");
      } finally {
        setIsConnecting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader type={"connection"} />

      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <h1 className="text-base sm:text-lg font-semibold text-gray-900">
                MongoDB Connections
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {connections.length > 0 && (
              <div className="text-xs sm:text-sm text-gray-600">
                {connections.length} saved connection
                {connections.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {/* Privacy Alert */}
        <Alert className="border-blue-200 bg-blue-50 mb-4 sm:mb-6">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            <strong>Privacy First:</strong> All connections are stored locally
            in your browser. We never see or store your connection details.
          </AlertDescription>
        </Alert>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-h-[calc(100vh-280px)] sm:h-[calc(100vh-240px)]">
          {/* Left: New Connection */}
          <Card className="border-gray-200 flex flex-col">
            <CardHeader className="border-b border-gray-100 flex-shrink-0 p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                New Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 sm:p-6">
              {/* Connection Form - Fixed at top */}
              <div className="space-y-4 mb-8">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:relative">
                  <Input
                    type="text"
                    placeholder="mongodb://username:password@host:port/database"
                    value={mongoUrl}
                    onChange={(e) => {
                      setMongoUrl(e.target.value);
                      if (validationError) setValidationError("");
                    }}
                    className="h-10 sm:h-12 text-xs sm:text-sm font-mono px-3 sm:px-4 sm:pr-32 border-gray-300 focus:border-blue-500 focus:ring-blue-500 flex-1"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                  />
                  <Button
                    onClick={handleConnect}
                    disabled={!mongoUrl.trim() || isConnecting}
                    className="sm:absolute sm:right-2 sm:top-2 h-10 sm:h-8 px-4 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm"
                  >
                    {isConnecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        <span className="hidden sm:inline">Connecting...</span>
                        <span className="sm:hidden">Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Server className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>

                {validationError && (
                  <Alert
                    variant="destructive"
                    className="border-red-200 bg-red-50"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {validationError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right: Recent Connections */}
          <Card className="border-gray-200 flex flex-col">
            <CardHeader className="border-b border-gray-100 flex-shrink-0 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-50 rounded-lg flex items-center justify-center">
                    <History className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  </div>
                  <span className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    Recent Connections
                    {connections.length > 0 && (
                      <span className="text-xs sm:text-sm font-normal text-gray-500">
                        ({connections.length})
                      </span>
                    )}
                  </span>
                </CardTitle>
                {connections.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadConnections}
                      className="h-8"
                    >
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearConnections}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-8"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 px-4 sm:px-6 overflow-auto">
              {isLoadingConnections ? (
                <LoadingConnections />
              ) : connections.length > 0 ? (
                <div className="space-y-3 py-4">
                  {connections.map((connection, i) => (
                    <ConnectionCard
                      connection={connection}
                      key={i}
                      clearConnectionById={clearConnectionById}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <History className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    No saved connections
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 max-w-sm px-4 sm:px-0">
                    Your connection history will appear here after you connect
                    to a database for the first time.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
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
                  ? "This will remove all connection history from your browser. This action cannot be undone."
                  : "This will remove this connection from your history. This action cannot be undone."}
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
    </div>
  );
}

// Loading Connections Skeleton
function LoadingConnections() {
  return (
    <div className="space-y-3 py-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gray-200" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-32 sm:h-4 sm:w-48 bg-gray-200" />
                <Skeleton className="h-2 w-24 sm:h-3 sm:w-32 bg-gray-200" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 sm:h-8 sm:w-20 bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

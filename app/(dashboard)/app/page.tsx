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
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900">
                MongoDB Connections
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {connections.length > 0 && (
              <div className="text-sm text-gray-600">
                {connections.length} saved connection
                {connections.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6">
        {/* Privacy Alert */}
        <Alert className="border-blue-200 bg-blue-50 mb-6">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Privacy First:</strong> All connections are stored locally
            in your browser. We never see or store your connection details.
          </AlertDescription>
        </Alert>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-240px)]">
          {/* Left: New Connection */}
          <Card className="border-gray-200 flex flex-col">
            <CardHeader className="border-b border-gray-100 flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Plus className="h-4 w-4 text-blue-600" />
                </div>
                New Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-6">
              {/* Connection Form - Fixed at top */}
              <div className="space-y-4 mb-8">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="mongodb://username:password@host:port/database"
                    value={mongoUrl}
                    onChange={(e) => {
                      setMongoUrl(e.target.value);
                      if (validationError) setValidationError("");
                    }}
                    className="h-12 text-sm font-mono px-4 pr-32 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                  />
                  <Button
                    onClick={handleConnect}
                    disabled={!mongoUrl.trim() || isConnecting}
                    className="absolute right-2 top-2 h-8 px-4 bg-blue-600 hover:bg-blue-700"
                  >
                    {isConnecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Connecting...
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
                    <AlertDescription>{validationError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right: Recent Connections */}
          <Card className="border-gray-200 flex flex-col">
            <CardHeader className="border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gray-50 rounded-lg flex items-center justify-center">
                    <History className="h-4 w-4 text-gray-600" />
                  </div>
                  Recent Connections
                  {connections.length > 0 && (
                    <span className="text-sm font-normal text-gray-500">
                      ({connections.length})
                    </span>
                  )}
                </CardTitle>
                {connections.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadConnections}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearConnections}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 px-6 overflow-auto">
              {isLoadingConnections ? (
                <LoadingConnections />
              ) : connections.length > 0 ? (
                <div className="space-y-3">
                  {connections.map((connection, i) => (
                    <ConnectionCard
                      connection={connection}
                      key={i}
                      clearConnectionById={clearConnectionById}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <History className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No saved connections
                  </h3>
                  <p className="text-gray-600 max-w-sm">
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {deleteConfirm?.type === "all"
                  ? "Clear All Connections?"
                  : "Delete Connection?"}
              </DialogTitle>
              <DialogDescription>
                {deleteConfirm?.type === "all"
                  ? "This will remove all connection history from your browser. This action cannot be undone."
                  : "This will remove this connection from your history. This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
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
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-lg bg-gray-200" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48 bg-gray-200" />
                <Skeleton className="h-3 w-32 bg-gray-200" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Database, History, Trash2, Info, RefreshCw } from "lucide-react";

import { ConnectionCard } from "@/components/connections/connection-card";
import { useRouter } from "next/navigation";
import { StorageManager } from "@/lib/storage";
import { testMongoConnection } from "@/lib/mongodb";

export default function AppPage() {
  const [mongoUrl, setMongoUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const router = useRouter();

  const [connections, setConnections] = useState<IConnection[]>([]);

  useEffect(() => {
    setConnections(StorageManager.getConnections());
  }, []);

  const loadConnections = () => {
    setConnections(StorageManager.getConnections());
  };

  const clearConnections = () => {
    StorageManager.removeAllConnections();
    loadConnections();
  };

  const handleConnect = async () => {
    if (!!validationError || !mongoUrl.trim()) {
    } else {
      // Now Test the connection url
      setIsConnecting(true);
      try {
        const response = await testMongoConnection(mongoUrl);

        if (!response.success) {
          setValidationError(response?.message || "Something went wrong");
        } else {
          // Successfully connected
          const addedConnection = StorageManager.addConnection(mongoUrl);

          // Redirect to
          router.push("/app/databases?id=" + addedConnection);
        }
      } catch (e) {
        setValidationError("Something went wrong, Please try agan later.");
      } finally {
        setIsConnecting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Privacy Alert */}
        <Alert className="mb-8 border-blue-200 bg-blue-50/50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            We don't store any information on our end, everything is stored in
            your browser.
          </AlertDescription>
        </Alert>

        {/* Main Connection Section */}
        <Card className="bg-muted/20 border-2 border-dashed border-muted-foreground/20">
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Database className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-mono font-bold">
                    Connect to MongoDB
                  </h1>
                </div>

                <div className="space-y-4 max-w-2xl mx-auto">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="mongodb://username:password@host:port/database"
                      value={mongoUrl}
                      onChange={(e) => setMongoUrl(e.target.value)}
                      className="h-14 text-base font-mono px-4 pr-32"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                    />
                    <Button
                      onClick={handleConnect}
                      disabled={!mongoUrl.trim() || isConnecting}
                      className="absolute right-2 top-2 h-10 px-6"
                    >
                      {isConnecting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Enter your MongoDB connection string to browse databases,
                    collections, and documents
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection History */}
        {connections.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-border pl-0 my-14">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Recent Connections</h2>
                <span className="text-sm text-muted-foreground">
                  ({connections.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearConnections}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh all
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadConnections}
                  className="text-destructive hover:bg-transparent hover:text-destructive cursor-pointer bg-transparent"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>

            <div className="grid gap-2 gap-y-4">
              {connections.map((connection, i) => (
                <ConnectionCard
                  connection={connection}
                  key={i}
                  onClickRefresh={loadConnections}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {connections.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent connections</p>
            <p className="text-sm">Your connection history will appear here</p>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { DatabaseErrorState } from "@/components/database/database-error-state";
import { DatabaseCard } from "@/components/database/database-card";
import { DatabaseEmptyState } from "@/components/database/database-empty-state";

import { StorageManager } from "@/lib/storage";
import { useSearchParams } from "next/navigation";
import { fetchDatabases } from "@/lib/mongodb";
import { useMounted } from "@/lib/hooks/use-mounted";

export default function DatabasesContent() {
  const mounted = useMounted();
  const searchParams = useSearchParams();
  const connectionId = searchParams.get("connectionId");

  const [databases, setDatabases] = useState<IDatabase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadDatabases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!connectionId) {
        throw new Error("Invalid id");
      }

      const connectionData: IConnection | undefined =
        StorageManager.getConnectionDetails(connectionId);

      if (!connectionData) {
        throw new Error("Invalid id entered");
      }

      const response = await fetchDatabases(connectionData.url);
      if (!response || typeof response !== "object") {
        throw new Error("Server returned an invalid response. Please try again.");
      }
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch databases");
      } else {
        setDatabases(response.data || []);
      }

      setIsLoading(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to load databases: ${errorMessage}`);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadDatabases();
  }, []);

  const filteredDatabases = databases
    .filter((db) => {
      const matchesSearch = db.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Prevent hydration mismatch: show loading skeleton until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <LoadingGrid />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4">
          <DatabaseErrorState errorMessage={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        {/* Search bar inline above cards */}
        <div className="mb-4">
          {isLoading ? (
            <div className="relative w-64">
              <div className="h-8 rounded-md border border-gray-300 bg-white">
                <div className="flex items-center px-3 py-2">
                  <Skeleton className="h-4 w-4 bg-gray-200 mr-3" />
                  <Skeleton className="h-3 w-32 bg-gray-200" />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search databases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 h-8 text-sm border-gray-300"
              />
            </div>
          )}
        </div>

        {isLoading ? (
          <LoadingGrid />
        ) : filteredDatabases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDatabases.map((db, i) => (
              <DatabaseCard database={db} connectionId={connectionId!} key={i} />
            ))}
          </div>
        ) : (
          <DatabaseEmptyState
            searchTerm={searchTerm}
            clearSearch={() => setSearchTerm("")}
          />
        )}
      </div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-3">
            <Skeleton className="h-4 bg-gray-200 w-3/4" />
            <Skeleton className="h-3 bg-gray-200 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-3 bg-gray-200 w-full" />
            <Skeleton className="h-3 bg-gray-200 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

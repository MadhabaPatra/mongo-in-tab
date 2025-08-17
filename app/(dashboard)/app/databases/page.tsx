"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Database, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { DatabaseStatsSkeletonLoader } from "@/components/database/database-stats-skeleton-loader";
import { DatabaseErrorState } from "@/components/database/database-error-state";
import { DatabaseCard } from "@/components/database/database-card";
import { DatabaseStats } from "@/components/database/database-stats";

import { StorageManager } from "@/lib/storage";
import { useSearchParams } from "next/navigation";
import { fetchDatabases } from "@/lib/mongodb";
import { DatabaseEmptyState } from "@/components/database/database-empty-state";
import { AppHeader } from "@/components/app-header";

export default function DatabasesPage() {
  const searchParams = useSearchParams();
  const connectionId = searchParams.get("connectionId");

  const [databases, setDatabases] = useState<IDatabase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch databases");
      } else {
        setDatabases(response.data || []);
      }

      setIsLoading(false);

      // Add this database for caching
      //StorageManager.addConnection(connectionUrl);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to load databases: ${errorMessage}`);
    }
  };

  useEffect(() => {
    loadDatabases();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");

  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const filteredDatabases = databases.filter((db) => {
    const matchesSearch = db.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Error State
  if (error) {
    return <DatabaseErrorState errorMessage={error} />;
  }

  return (
    <div>
      <AppHeader type={"database"} />
      <div className="py-8 px-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search databases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats Cards */}
        {/*{isLoadingStats ? (*/}
        {/*  <DatabaseStatsSkeletonLoader />*/}
        {/*) : (*/}
        {/*  <DatabaseStats*/}
        {/*    data={{*/}
        {/*      totalDatabases: 0,*/}
        {/*      totalCollections: 0,*/}
        {/*      totalDocuments: 0,*/}
        {/*    }}*/}
        {/*  />*/}
        {/*)}*/}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Database Grid */}
            {filteredDatabases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDatabases.map((db, i) => (
                  <DatabaseCard database={db} key={i} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <DatabaseEmptyState
                searchTerm={searchTerm}
                clearSearch={() => setSearchTerm("")}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

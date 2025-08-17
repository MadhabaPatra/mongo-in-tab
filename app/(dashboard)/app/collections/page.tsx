"use client";
import { useEffect, useState } from "react";
import { Database, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { StorageManager } from "@/lib/storage";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchCollections, fetchDatabases } from "@/lib/mongodb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CollectionErrorState } from "@/components/collections/collection-error-state";
import { CollectionEmptyState } from "@/components/collections/collection-empty-state";
import { CollectionCard } from "@/components/collections/collection-card";
import { AppHeader } from "@/components/app-header";

export default function CollectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const connectionId = searchParams.get("connectionId");
  const database = searchParams.get("database");

  const [databases, setDatabases] = useState<IDatabase[]>([]);
  const [isLoadingDatabases, setIsLoadingDatabases] = useState(false);

  const [currentDatabase, setCurrentDatabase] = useState("");

  const [collections, setCollections] = useState<ICollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDatabases = async () => {
    setIsLoadingDatabases(true);
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
        if (!response.data?.find((each) => each.name === database)) {
          throw new Error("Invalid database is selected.");
        }
      }

      setIsLoadingDatabases(false);
      if (database) {
        setCurrentDatabase(database);
      }

      // Add this database for caching
      //StorageManager.addConnection(connectionUrl);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to load collections: ${errorMessage}`);
    }
  };

  const loadCollections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!connectionId || !currentDatabase) {
        throw new Error("Invalid connection id or invalid database");
      }

      const connectionData: IConnection | undefined =
        StorageManager.getConnectionDetails(connectionId);

      if (!connectionData) {
        throw new Error("Invalid connection id entered");
      }

      const response = await fetchCollections(
        connectionData.url,
        currentDatabase,
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch collections");
      } else {
        setCollections(response.data || []);
      }

      setIsLoading(false);

      // Add this database for caching
      //StorageManager.addConnection(connectionUrl);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to load collections: ${errorMessage}`);
    }
  };

  useEffect(() => {
    loadDatabases();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    params.set("database", currentDatabase);

    router.replace(`?${params.toString()}`);
    if (currentDatabase) {
      loadCollections();
    }
  }, [currentDatabase]);

  const [searchTerm, setSearchTerm] = useState("");

  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const filteredCollections = collections.filter((collection) => {
    const matchesSearch = collection.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Error State
  if (error) {
    return (
      <CollectionErrorState errorMessage={error} onClickRefresh={() => {}} />
    );
  }

  return (
    <div>
      <AppHeader type={"collection"} />
      <div className="py-8 px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Database:</span>
              <Select
                value={currentDatabase}
                onValueChange={setCurrentDatabase}
                disabled={isLoadingDatabases}
              >
                <SelectTrigger className="w-[200px] bg-background border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {databases.map((db, i) => (
                    <SelectItem
                      key={i}
                      value={db.name}
                      className="hover:bg-primary/10 hover:text-primary cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono">{db.name}</span>
                        {/*<span className="text-xs font-mono ml-4 text-muted-foreground group-hover:text-white">*/}
                        {/*  {db.collections} collections*/}
                        {/*</span>*/}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collection..."
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
                <CardHeader className="pb-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Collection Grid */}
            {filteredCollections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCollections.map((collection, i) => (
                  <CollectionCard collection={collection} key={i} />
                ))}
              </div>
            ) : (
              <CollectionEmptyState
                searchTerm={searchTerm}
                clearSearch={() => {
                  setSearchTerm("");
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

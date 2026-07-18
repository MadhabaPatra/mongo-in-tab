"use client";

import { useEffect, useState } from "react";
import { Search, FolderOpen, Database, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { StorageManager } from "@/lib/storage";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchCollections, fetchDatabases } from "@/lib/mongodb";
import { CollectionErrorState } from "@/components/collections/collection-error-state";
import { CollectionEmptyState } from "@/components/collections/collection-empty-state";
import { CollectionCard } from "@/components/collections/collection-card";
import { AppHeader } from "@/components/app-header";
import { useMounted } from "@/lib/hooks/use-mounted";

export default function CollectionsContent() {
  const mounted = useMounted();
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
  const [searchTerm, setSearchTerm] = useState("");
  const [databaseSearch, setDatabaseSearch] = useState("");

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

  const filteredCollections = collections
    .filter((collection) => {
      const matchesSearch = collection.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Prevent hydration mismatch: show loading skeleton until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader type={"collection"} />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <LoadingGrid />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader type="collection" breadcrumbEnd={<DatabaseSelectorSkeleton />} />
        <div className="p-4">
          <CollectionErrorState
            errorMessage={error}
            onClickRefresh={loadDatabases}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        type="collection"
        breadcrumbEnd={
          isLoadingDatabases ? (
            <DatabaseSelectorSkeleton />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-foreground bg-muted/30 whitespace-nowrap outline-none cursor-pointer hover:bg-muted/50 transition-colors">
                <Database className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="max-w-[140px] truncate">
                  {currentDatabase || "Select database"}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60 p-0">
                {/* Search */}
                <div className="p-2 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search databases..."
                      value={databaseSearch}
                      onChange={(e) => setDatabaseSearch(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                      }}
                      className="pl-7 h-8 text-xs border-gray-200"
                      autoFocus
                    />
                  </div>
                </div>
                {/* Database list */}
                <ScrollArea className="max-h-60">
                  {databases
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .filter((db) =>
                      db.name
                        .toLowerCase()
                        .includes(databaseSearch.toLowerCase()),
                    )
                    .map((db, i) => (
                      <DropdownMenuItem
                        key={i}
                        onClick={() => {
                          setCurrentDatabase(db.name);
                          setDatabaseSearch("");
                        }}
                        className={`text-xs cursor-pointer ${
                          currentDatabase === db.name
                            ? "bg-muted font-medium"
                            : ""
                        }`}
                      >
                        {db.name}
                      </DropdownMenuItem>
                    ))}
                  {databases.filter((db) =>
                    db.name
                      .toLowerCase()
                      .includes(databaseSearch.toLowerCase()),
                  ).length === 0 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                      No databases found
                    </div>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      />

      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        {/* Search bar inline above cards */}
        <div className="mb-4">
          {isLoadingDatabases || isLoading ? (
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
                placeholder="Search collections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 h-8 text-sm border-gray-300"
              />
            </div>
          )}
        </div>

        {isLoadingDatabases || isLoading ? (
          <LoadingGrid />
        ) : !currentDatabase ? (
          <EmptyDatabaseState />
        ) : filteredCollections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCollections.map((collection, i) => (
              <CollectionCard collection={collection} key={i} />
            ))}
          </div>
        ) : (
          <CollectionEmptyState
            searchTerm={searchTerm}
            clearSearch={() => setSearchTerm("")}
          />
        )}
      </div>
    </div>
  );
}

function DatabaseSelectorSkeleton() {
  return (
    <div className="flex items-center gap-1.5 rounded-md px-2 py-1 bg-muted/30">
      <Skeleton className="h-3.5 w-3.5 bg-gray-200 rounded" />
      <Skeleton className="h-3 w-24 bg-gray-200 rounded" />
      <Skeleton className="h-3 w-3 bg-gray-200 rounded" />
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
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-3 bg-gray-200 w-1/2" />
            <Skeleton className="h-3 bg-gray-200 w-2/3" />
            <Skeleton className="h-3 bg-gray-200 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyDatabaseState() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Select a Database
        </h3>
        <p className="text-sm text-gray-600">
          Choose a database to view its collections
        </p>
      </CardContent>
    </Card>
  );
}

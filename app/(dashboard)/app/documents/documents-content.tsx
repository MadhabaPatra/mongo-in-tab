"use client";

import { useEffect, useState } from "react";
import {
  FolderOpen,
  X,
  FileText,
  Search,
  ChevronDown,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { StorageManager } from "@/lib/storage";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchCollections, fetchDocuments } from "@/lib/mongodb";
import { DocumentErrorState } from "@/components/documents/document-error-state";
import { useMounted } from "@/lib/hooks/use-mounted";
import { DocumentsTableView } from "@/components/documents/documents-table-view";
import { DocumentsEmptyState } from "@/components/documents/documents-empty-state";
import { HeaderSlot } from "@/components/header-slot";
import { FilterDocuments } from "@/components/documents/filter-documents";
import { DocumentsCardView } from "@/components/documents/documents-card-view";

export default function DocumentsContent() {
  const mounted = useMounted();
  const router = useRouter();
  const searchParams = useSearchParams();

  const connectionId = searchParams.get("connectionId");
  const database = searchParams.get("database");
  const collectionName = searchParams.get("collectionName");

  const [collections, setCollections] = useState<ICollection[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [currentCollection, setCurrentCollection] = useState(collectionName || "");
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<IDocumentPagination>({
    currentPage: 1,
    totalPages: 0,
    totalDocuments: 0,
    start: 0,
    end: 0,
  });
  const [mongoQuery, setMongoQuery] = useState("{}");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    if (currentCollection) {
      const params = new URLSearchParams(window.location.search);
      params.set("collectionName", currentCollection);
      router.replace(`?${params.toString()}`);
      loadDocuments(25, 1);
    }
  }, [currentCollection, mongoQuery]);

  const loadCollections = async () => {
    setIsLoadingCollections(true);
    setError(null);

    try {
      if (!connectionId || !database) {
        throw new Error("Connection ID and database are required");
      }

      const connectionData = StorageManager.getConnectionDetails(connectionId);
      if (!connectionData) {
        throw new Error("Invalid connection ID");
      }

      const response = await fetchCollections(connectionData.url, database);

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch collections");
      }

      setCollections(response.data || []);

      if (
        collectionName &&
        response.data?.find((c) => c.name === collectionName)
      ) {
        setCurrentCollection(collectionName);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to load collections: ${errorMessage}`);
    } finally {
      setIsLoadingCollections(false);
    }
  };

  const loadDocuments = async (limit = 25, pageNo = 1) => {
    if (!connectionId || !database || !currentCollection) return;

    setIsLoading(true);
    setError(null);

    try {
      const connectionData = StorageManager.getConnectionDetails(connectionId);
      if (!connectionData) {
        throw new Error("Invalid connection ID");
      }

      const response = await fetchDocuments(
        connectionData.url,
        database,
        currentCollection,
        mongoQuery === "{}" ? "" : mongoQuery,
        pageNo,
        limit,
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch documents");
      }

      setDocuments(response.data?.documents || []);
      setPagination(
        response.data?.pagination || {
          currentPage: pageNo,
          totalPages: 0,
          totalDocuments: 0,
          start: 0,
          end: 0,
        },
      );
      setFields(response.data?.fields || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to load documents: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilter = () => {
    setMongoQuery("{}");
  };

  const handlePaginationChange = (limit: number, pageNo: number) => {
    loadDocuments(limit, pageNo);
  };

  const handleFilterApplied = (query: string) => {
    setMongoQuery(query);
  };

  const handleCollectionChange = (collectionName: string) => {
    setCurrentCollection(collectionName);
    setDocuments([]);
    setPagination({
      currentPage: 1,
      totalPages: 0,
      totalDocuments: 0,
      start: 0,
      end: 0,
    });
  };

  // Prevent hydration mismatch: show loading skeleton until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderSlot>
          <CollectionBreadcrumbDropdown
            collections={collections}
            currentCollection={currentCollection}
            onCollectionChange={handleCollectionChange}
            loading={isLoadingCollections}
          />
        </HeaderSlot>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <LoadingGrid />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderSlot>
          <CollectionBreadcrumbDropdown
            collections={collections}
            currentCollection={currentCollection}
            onCollectionChange={handleCollectionChange}
            loading={isLoadingCollections}
          />
        </HeaderSlot>
        <div className="p-4">
          <DocumentErrorState
            errorMessage={error}
            onClickRefresh={loadCollections}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderSlot>
        <CollectionBreadcrumbDropdown
          collections={collections}
          currentCollection={currentCollection}
          onCollectionChange={handleCollectionChange}
          loading={isLoadingCollections}
        />
      </HeaderSlot>

      <div className="py-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {currentCollection && !isLoadingCollections && (
          <>
            <FilterDocuments
              fields={fields}
              onFilterApplied={handleFilterApplied}
              currentFilter={mongoQuery}
            />
            {mongoQuery !== "{}" && mongoQuery.trim() && (
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {mongoQuery}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilter}
                  className="h-7 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        {isLoadingCollections || isLoading ? (
          <LoadingGrid />
        ) : !currentCollection ? (
          <EmptyCollectionState />
        ) : documents.length === 0 ? (
          <DocumentsEmptyState searchTerm={mongoQuery} />
        ) : viewMode === "table" && connectionId && database ? (
          <DocumentsTableView
            connectionId={connectionId}
            database={database}
            collectionName={currentCollection}
            documents={documents}
            fields={fields}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onLoadDocuments={() => {
              loadDocuments(25, pagination.currentPage);
            }}
          />
        ) : viewMode === "card" && connectionId && database ? (
          <DocumentsCardView
            connectionId={connectionId}
            database={database}
            collectionName={currentCollection}
            documents={documents}
            fields={fields}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onLoadDocuments={() => {
              loadDocuments(25, pagination.currentPage);
            }}
          />
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-red-600">
                Invalid request <br /> Refresh
              </p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}

function CollectionBreadcrumbDropdown({
  collections,
  currentCollection,
  onCollectionChange,
  loading,
}: {
  collections: ICollection[];
  currentCollection: string;
  onCollectionChange: (name: string) => void;
  loading?: boolean;
}) {
  const [search, setSearch] = useState("");

  const filtered = collections
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-foreground bg-muted/30 whitespace-nowrap outline-none cursor-pointer hover:bg-muted/50 transition-colors">
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="max-w-[140px] truncate">
          {currentCollection || "Select collection"}
        </span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60 p-0">
        {/* Search */}
        <div className="p-2 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                // Stop dropdown typeahead from hijacking keystrokes
                e.stopPropagation();
              }}
              className="pl-7 h-8 text-xs border-gray-200"
              autoFocus
            />
          </div>
        </div>
        {/* Collection list */}
        <ScrollArea className="max-h-60">
          {loading ? (
            <div className="p-2 space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full bg-gray-100 rounded" />
              ))}
            </div>
          ) : (
            <>
              {filtered.map((collection, i) => (
                <DropdownMenuItem
                  key={i}
                  onClick={() => {
                    onCollectionChange(collection.name);
                    setSearch("");
                  }}
                  className={`text-xs cursor-pointer ${
                    currentCollection === collection.name
                      ? "bg-muted font-medium"
                      : ""
                  }`}
                >
                  {collection.name}
                </DropdownMenuItem>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                  No collections found
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CollectionSelectorSkeleton() {
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
    <div className="space-y-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  );
}

function EmptyCollectionState() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Select a Collection
        </h3>
        <p className="text-sm text-gray-600">
          Choose a collection to view its documents
        </p>
      </CardContent>
    </Card>
  );
}

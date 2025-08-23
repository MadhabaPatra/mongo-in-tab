"use client";
import { useEffect, useState } from "react";
import {
  Database,
  FolderOpen,
  List,
  Grid,
  X,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { StorageManager } from "@/lib/storage";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchCollections, fetchDocuments, saveADocument } from "@/lib/mongodb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentErrorState } from "@/components/documents/document-error-state";
import { DocumentsPagination } from "@/components/documents/documents-pagination";
import { DocumentsTableView } from "@/components/documents/documents-table-view";
import { DocumentsEmptyState } from "@/components/documents/documents-empty-state";
import { AppHeader } from "@/components/app-header";
import Link from "next/link";
import { getDatabaseLink } from "@/lib/utils";
import { FilterDocuments } from "@/components/documents/filter-documents";

export default function DocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Parameters
  const connectionId = searchParams.get("connectionId");
  const database = searchParams.get("database");
  const collectionName = searchParams.get("collectionName");

  // State
  const [collections, setCollections] = useState<ICollection[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [currentCollection, setCurrentCollection] = useState("");
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

  // Initialize collections on mount
  useEffect(() => {
    loadCollections();
  }, []);

  // Handle collection change
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

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader type={"document"} />
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
      <AppHeader type={"document"} />

      {/* Compact Header Bar */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left: Database + Collection Selector */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link
                href={getDatabaseLink(connectionId, database)}
                className="flex items-center space-x-1.5 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <Database className="h-4 w-4" />
                <span>{database}</span>
              </Link>
              <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
            </div>

            {isLoadingCollections ? (
              <CollectionSelectorSkeleton />
            ) : (
              <Select
                value={currentCollection}
                onValueChange={handleCollectionChange}
                disabled={isLoadingCollections}
              >
                <SelectTrigger className="w-[200px] h-8 text-sm border-gray-300">
                  <SelectValue placeholder="Select collection..." />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((collection, i) => (
                    <SelectItem
                      key={i}
                      value={collection.name}
                      className="text-sm"
                    >
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Right: Pagination + View Toggle */}
          <div className="flex items-center space-x-4">
            {/* Pagination */}
            {pagination.totalDocuments > 0 &&
              !isLoading &&
              !isLoadingCollections && (
                <DocumentsPagination
                  pagination={pagination}
                  onPaginationChange={handlePaginationChange}
                />
              )}

            {(pagination.totalDocuments > 0 || isLoadingCollections) && (
              <Separator orientation="vertical" className="h-5" />
            )}

            {/* View Toggle */}
            {isLoadingCollections ? (
              <ViewToggleSkeleton />
            ) : (
              <div className="flex items-center rounded-md border border-gray-300 p-1">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="h-6 px-2 text-xs"
                >
                  <List className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === "card" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("card")}
                  className="h-6 px-2 text-xs"
                >
                  <Grid className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Bar */}
      <div className="py-2 max-w-7xl mx-auto">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-4">
        {/* Content Area */}
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
          />
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <Grid className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Card view coming soon</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Collection Selector Skeleton
function CollectionSelectorSkeleton() {
  return (
    <div className="w-[200px] h-8 rounded-md border border-gray-300 bg-white">
      <div className="flex items-center justify-between px-3 py-2">
        <Skeleton className="h-3 w-24 bg-gray-200" />
        <Skeleton className="h-3 w-3 bg-gray-200" />
      </div>
    </div>
  );
}

// View Toggle Skeleton
function ViewToggleSkeleton() {
  return (
    <div className="flex items-center rounded-md border border-gray-300 p-1 bg-white">
      <Skeleton className="h-6 w-6 mr-1 bg-gray-200" />
      <Skeleton className="h-6 w-6 bg-gray-200" />
    </div>
  );
}

// Compact Loading Component
function LoadingGrid() {
  return (
    <div className="space-y-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  );
}

// Empty Collection State
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

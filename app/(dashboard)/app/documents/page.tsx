"use client";
import { useEffect, useState } from "react";
import {
  Database,
  FileX,
  List,
  Grid,
  ArrowUp,
  ArrowDown,
  Badge,
  X,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

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

import { Button } from "@/components/ui/button";

import { FilterDocuments } from "@/components/documents/filter-documents";
import { DocumentsPagination } from "@/components/documents/documents-pagination";
import { DocumentsTableView } from "@/components/documents/documents-table-view";
import { DocumentsEmptyState } from "@/components/documents/documents-empty-state";
import { AppHeader } from "@/components/app-header";
import { toast } from "sonner";
import { ObjectId } from "mongodb";

export default function DocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Parameters
  const connectionId = searchParams.get("connectionId");
  const database = searchParams.get("database");
  const collectionName = searchParams.get("collectionName");

  // Load Collections for select box
  const [collections, setCollections] = useState<ICollection[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

  // Currently selected collection
  const [currentCollection, setCurrentCollection] = useState("");

  // Main data (Documents)
  const [documents, setDocuments] = useState<IDocument[]>([]);

  const [pagination, setPagination] = useState<IDocumentPagination>({
    currentPage: 1,
    totalPages: 0,
    totalDocuments: 0,
    start: 0,
    end: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mongoQuery, setMongoQuery] = useState("{}");
  const [fields, setFields] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const [sortField, setSortField] = useState("_id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const loadCollections = async () => {
    setIsLoadingCollections(true);
    setIsLoading(true);
    setError(null);
    try {
      if (!connectionId || !database) {
        throw new Error("Invalid connection id or invalid database");
      }

      const connectionData: IConnection | undefined =
        StorageManager.getConnectionDetails(connectionId);

      if (!connectionData) {
        throw new Error("Invalid id entered");
      }

      const response = await fetchCollections(connectionData.url, database);

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch collections");
      } else {
        setCollections(response.data || []);
        if (!response.data?.find((each) => each.name === collectionName)) {
          throw new Error("Invalid collection is selected.");
        }
      }
      setIsLoadingCollections(false);
      if (collectionName) {
        setCurrentCollection(collectionName);
      }

      // Add this collection for caching
      //StorageManager.addConnection(connectionUrl);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to load collections: ${errorMessage}`);
    }
  };

  const loadDocuments = async (limit = 25, pageNo = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!connectionId || !database || !currentCollection) {
        throw new Error(
          "Invalid connection id or invalid database or collectionName",
        );
      }

      const connectionData: IConnection | undefined =
        StorageManager.getConnectionDetails(connectionId);

      if (!connectionData) {
        throw new Error("Invalid connection id entered");
      }

      const response = await fetchDocuments(
        connectionData.url,
        database,
        currentCollection,
        "",
        pageNo,
        limit,
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch collections");
      } else {
        setDocuments(response.data?.documents || []);
        if (response.data?.pagination) {
          setPagination(response.data?.pagination);
        }

        setFields(response.data?.fields || []);
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
    loadCollections();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    params.set("collectionName", currentCollection);

    router.replace(`?${params.toString()}`);
    if (currentCollection) {
      loadDocuments();
    }
  }, [currentCollection]);

  const filterApplied = () => {
    alert("triggered");
  };

  const paginationChanged = (limit: number, pageNo: number) => {
    loadDocuments(limit, pageNo);
  };

  // Error State
  if (error) {
    return (
      <DocumentErrorState errorMessage={error} onClickRefresh={() => {}} />
    );
  }

  return (
    <div>
      <AppHeader type={"document"} />
      <div className="py-8 px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Collections:</span>
              <Select
                value={currentCollection}
                onValueChange={setCurrentCollection}
                disabled={isLoadingCollections}
              >
                <SelectTrigger className="w-[200px] bg-background border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((db, i) => (
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

        {/*  Start from here*/}
        {/* Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/*<FilterDocuments fields={fields} filterApplied={() => {}} />*/}

            {mongoQuery !== "{}" && mongoQuery.trim() && (
              <div className="flex items-center gap-2">
                <Badge className="font-mono text-xs">Active Filter</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMongoQuery("{}");
                  }}
                  className="h-6 w-6 p-0 hover:bg-transparent hover:text-destructive cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/*<div className="flex items-center gap-3">*/}
            {/*  <div className="flex items-center gap-2">*/}
            {/*    <Button*/}
            {/*      variant={viewMode === "table" ? "default" : "outline"}*/}
            {/*      size="sm"*/}
            {/*      onClick={() => setViewMode("table")}*/}
            {/*      className="cursor-pointer"*/}
            {/*    >*/}
            {/*      <List className="h-4 w-4" />*/}
            {/*    </Button>*/}
            {/*    <Button*/}
            {/*      variant={viewMode === "card" ? "default" : "outline"}*/}
            {/*      size="sm"*/}
            {/*      onClick={() => setViewMode("card")}*/}
            {/*      className="cursor-pointer"*/}
            {/*    >*/}
            {/*      <Grid className="h-4 w-4" />*/}
            {/*    </Button>*/}
            {/*  </div>*/}

            {/*  <div className="flex items-center gap-2">*/}
            {/*    <Select value={sortField} onValueChange={setSortField}>*/}
            {/*      <SelectTrigger className="w-[120px]">*/}
            {/*        <SelectValue placeholder="Sort by" />*/}
            {/*      </SelectTrigger>*/}
            {/*      <SelectContent>*/}
            {/*        {fields.map((field) => (*/}
            {/*          <SelectItem key={field} value={field}>*/}
            {/*            {field}*/}
            {/*          </SelectItem>*/}
            {/*        ))}*/}
            {/*      </SelectContent>*/}
            {/*    </Select>*/}
            {/*    <Button*/}
            {/*      variant="outline"*/}
            {/*      size="sm"*/}
            {/*      // onClick={() =>*/}
            {/*      //   setSortOrder(sortOrder === "asc" ? "desc" : "asc")*/}
            {/*      // }*/}
            {/*      className="cursor-pointer"*/}
            {/*    >*/}
            {/*      {sortOrder === "asc" ? (*/}
            {/*        <ArrowUp className="h-4 w-4" />*/}
            {/*      ) : (*/}
            {/*        <ArrowDown className="h-4 w-4" />*/}
            {/*      )}*/}
            {/*    </Button>*/}
            {/*  </div>*/}
            {/*</div>*/}
          </div>

          {/* Pagination */}
          {pagination?.totalDocuments > 0 && (
            <DocumentsPagination
              pagination={pagination}
              onPaginationChange={paginationChanged}
            />
          )}
        </div>

        {/* Documents List */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                    <div className="h-8 w-20 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : documents.length > 0 &&
          connectionId &&
          database &&
          collectionName ? (
          viewMode === "table" ? (
            <DocumentsTableView
              connectionId={connectionId}
              database={database}
              collectionName={collectionName}
              documents={documents}
              fields={fields}
            />
          ) : (
            <div>Still in development.</div>
          )
        ) : (
          <DocumentsEmptyState searchTerm={mongoQuery} />
        )}
      </div>
    </div>
  );
}

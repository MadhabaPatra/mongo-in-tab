"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { validateQueryString } from "@/lib/utils";
import { toast } from "sonner";
import {
  Play,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Table,
  LayoutGrid,
  FileJson,
  Plus,
  Trash2,
  Clock,
  Star,
  History,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentsOptionsModal } from "./documents-options-modal";

interface DocumentsToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onRunQuery: () => void;
  options: DocumentQueryOptions;
  onOptionsChange: (options: DocumentQueryOptions) => void;
  pagination: IDocumentPagination;
  limit: number;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  viewMode: "table" | "card" | "json";
  onViewModeChange: (mode: "table" | "card" | "json") => void;
  fields?: string[];
}

export function DocumentsToolbar({
  query,
  onQueryChange,
  onRunQuery,
  options,
  onOptionsChange,
  pagination,
  limit,
  onLimitChange,
  onPageChange,
  onRefresh,
  viewMode,
  onViewModeChange,
  fields,
}: DocumentsToolbarProps) {
  const [localQuery, setLocalQuery] = useState(query);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const validate = (value: string) => {
    const err = validateQueryString(value);
    setIsValid(!err);
  };

  const handleQueryChange = (value: string) => {
    setLocalQuery(value);
    validate(value);
  };

  const handleRun = () => {
    if (isValid) {
      onQueryChange(localQuery);
      onRunQuery();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleRun();
    }
  };

  const isFirstPage = pagination.currentPage <= 1;
  const isLastPage = pagination.currentPage >= pagination.totalPages;

  return (
    <div className="space-y-3">
      {/* Row 1: Query Box */}
      <div className="flex items-start gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={localQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='{"field": "value"}'
            className={`font-mono text-sm min-h-[40px] max-h-[120px] resize-y py-2 pr-20 ${
              !isValid ? "border-red-500 focus:border-red-500" : ""
            }`}
            rows={1}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* History dropdown (placeholder) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <History className="h-3.5 w-3.5 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-3 py-2 text-xs text-gray-400 text-center">
                  No query history yet
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Favorite star (placeholder) */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => toast.info("Save favorites coming soon")}
            >
              <Star className="h-3.5 w-3.5 text-gray-400" />
            </Button>
          </div>
        </div>

        <DocumentsOptionsModal
          options={options}
          onOptionsChange={onOptionsChange}
        />

        <Button
          size="sm"
          onClick={handleRun}
          disabled={!isValid}
          className="h-9 gap-1.5"
        >
          <Play className="h-3.5 w-3.5" />
          Run
        </Button>
      </div>

      {!isValid && (
        <p className="text-red-500 text-xs">Invalid JSON query syntax</p>
      )}

      {/* Row 2: Actions + Pagination + View Toggle */}
      <div className="flex items-center justify-between">
        {/* Left: Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8"
            onClick={() => toast.info("Add Data coming soon")}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => toast.info("Delete coming soon")}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>

        {/* Right: Pagination + View Toggle */}
        <div className="flex items-center gap-3">
          {/* Per page */}
          <Select
            value={limit.toString()}
            onValueChange={(v) => onLimitChange(Number.parseInt(v))}
          >
            <SelectTrigger className="h-8 text-xs w-[60px] bg-white border-black text-center justify-center">
              {limit}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="75">75 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>

          {/* Presentation info */}
          <span className="text-xs text-gray-500 whitespace-nowrap">
            <span className="font-medium text-gray-900">
              {pagination.start}-{pagination.end}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-900">
              {pagination.totalDocuments.toLocaleString()}
            </span>
          </span>

          {/* Field count */}
          {fields && fields.length > 0 && (
            <span className="text-xs text-gray-500 whitespace-nowrap">
              •{" "}
              <span className="font-medium text-gray-900">{fields.length} fields</span>
            </span>
          )}

          {/* Refresh */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-8 w-8 p-0"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>

          {/* Prev / Next */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={isFirstPage}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={isLastPage}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center rounded-md border border-gray-300 p-0.5">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("table")}
              className="h-7 px-2 text-xs gap-1"
            >
              <Table className="h-3 w-3" />
              Table
            </Button>
            <Button
              variant={viewMode === "card" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("card")}
              className="h-7 px-2 text-xs gap-1"
            >
              <LayoutGrid className="h-3 w-3" />
              Card
            </Button>
            <Button
              variant={viewMode === "json" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("json")}
              className="h-7 px-2 text-xs gap-1"
            >
              <FileJson className="h-3 w-3" />
              JSON
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

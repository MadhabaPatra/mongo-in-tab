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
import { Input } from "@/components/ui/input";
import { validateQueryString } from "@/lib/utils";
import { toast } from "sonner";
import {
  Play,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Table,
  LayoutGrid,
  FileJson,
  Plus,
  Trash2,
  RotateCw,
  Clock,
  Star,
  History,
  Filter,
  ArrowUpDown,
  Eye,
  SkipForward,
  Timer,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentsToolbarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onRunQuery: () => void;
  onReset: () => void;
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
  onReset,
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
  const [queryValid, setQueryValid] = useState(true);

  // Local option states
  const [localProject, setLocalProject] = useState(options.project || "{}");
  const [localSort, setLocalSort] = useState(options.sort || "{}");
  const [localSkip, setLocalSkip] = useState(options.skip?.toString() ?? "");
  const [localLimit, setLocalLimit] = useState(limit.toString());
  const [localMaxTime, setLocalMaxTime] = useState(
    options.maxTimeMS?.toString() ?? "",
  );

  const [optionErrors, setOptionErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalQuery(query);
    setQueryValid(!validateQueryString(query));
  }, [query]);

  useEffect(() => {
    setLocalProject(options.project || "{}");
    setLocalSort(options.sort || "{}");
    setLocalSkip(options.skip?.toString() ?? "");
    setLocalMaxTime(options.maxTimeMS?.toString() ?? "");
  }, [options]);

  useEffect(() => {
    setLocalLimit(limit.toString());
  }, [limit]);

  const validateQuery = (value: string) => {
    const err = validateQueryString(value);
    setQueryValid(!err);
  };

  const validateOption = (
    key: string,
    value: string,
    isJson = true,
  ): string => {
    if (!value || value.trim() === "{}") return "";
    if (isJson) {
      const err = validateQueryString(value);
      return err || "";
    }
    return "";
  };

  const handleFind = () => {
    const qErr = validateQueryString(localQuery);
    const pErr = validateOption("project", localProject);
    const sErr = validateOption("sort", localSort);
    const skipNum = localSkip ? Number.parseInt(localSkip) : undefined;
    const maxTimeNum = localMaxTime
      ? Number.parseInt(localMaxTime)
      : undefined;
    const limitNum = Number.parseInt(localLimit) || 25;

    const errors: Record<string, string> = {};
    if (qErr) errors.query = qErr;
    if (pErr) errors.project = pErr;
    if (sErr) errors.sort = sErr;
    if (localSkip && (Number.isNaN(skipNum) || (skipNum ?? -1) < 0)) {
      errors.skip = "Skip must be >= 0";
    }
    if (localMaxTime && (Number.isNaN(maxTimeNum) || (maxTimeNum ?? 0) < 1)) {
      errors.maxTimeMS = "Max time must be >= 1";
    }

    setOptionErrors(errors);
    setQueryValid(!qErr);

    if (Object.keys(errors).length > 0) {
      return;
    }

    onQueryChange(localQuery);
    onOptionsChange({
      project: localProject === "{}" ? undefined : localProject,
      sort: localSort === "{}" ? undefined : localSort,
      skip: skipNum,
      maxTimeMS: maxTimeNum,
    });
    onLimitChange(limitNum);
    onRunQuery();
  };

  const handleReset = () => {
    setLocalQuery("{}");
    setLocalProject("{}");
    setLocalSort("{}");
    setLocalSkip("");
    setLocalLimit("25");
    setLocalMaxTime("");
    setOptionErrors({});
    setQueryValid(true);
    onReset();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleFind();
    }
  };

  const isFirstPage = pagination.currentPage <= 1;
  const isLastPage = pagination.currentPage >= pagination.totalPages;

  const hasActiveOptions =
    localProject !== "{}" ||
    localSort !== "{}" ||
    localSkip !== "" ||
    localMaxTime !== "" ||
    localQuery !== "{}";

  return (
    <div className="space-y-3">
      {/* Row 1: Filter bar */}
      <div className="flex items-start gap-2">
        <div className="flex-1 relative">
          <div className="relative">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Filter
              </span>
            </div>
            <Textarea
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                validateQuery(e.target.value);
                if (optionErrors.query) {
                  setOptionErrors((prev) => {
                    const next = { ...prev };
                    delete next.query;
                    return next;
                  });
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="{ }"
              className={`font-mono text-sm min-h-[36px] max-h-[120px] resize-y py-2 pl-[4.5rem] pr-10 ${
                optionErrors.query || !queryValid
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }`}
              rows={1}
            />
            {/* History dropdown */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <History className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="px-3 py-2 text-xs text-gray-400 text-center">
                    No query history yet
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {(optionErrors.query || !queryValid) && (
            <p className="text-red-500 text-xs mt-1">
              {optionErrors.query || "Invalid JSON query syntax"}
            </p>
          )}
        </div>

        {/* Find button — Compass green */}
        <Button
          size="sm"
          onClick={handleFind}
          className="h-9 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
        >
          <Play className="h-3.5 w-3.5" />
          Find
        </Button>

        {/* Reset */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={!hasActiveOptions}
          className="h-9 gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      {/* Row 2: Options bar — Project, Sort, Skip, Limit, Max Time */}
      <div className="flex flex-wrap items-start gap-3">
        {/* Project */}
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center gap-1 mb-1">
            <Eye className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Project
            </span>
          </div>
          <Textarea
            value={localProject}
            onChange={(e) => {
              setLocalProject(e.target.value);
              if (optionErrors.project) {
                setOptionErrors((prev) => {
                  const next = { ...prev };
                  delete next.project;
                  return next;
                });
              }
            }}
            placeholder="{ }"
            className={`font-mono text-sm min-h-[32px] max-h-[80px] resize-y py-1.5 px-2 ${
              optionErrors.project ? "border-red-500 focus:border-red-500" : ""
            }`}
            rows={1}
          />
          {optionErrors.project && (
            <p className="text-red-500 text-xs mt-0.5">
              {optionErrors.project}
            </p>
          )}
        </div>

        {/* Sort */}
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center gap-1 mb-1">
            <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Sort
            </span>
          </div>
          <Textarea
            value={localSort}
            onChange={(e) => {
              setLocalSort(e.target.value);
              if (optionErrors.sort) {
                setOptionErrors((prev) => {
                  const next = { ...prev };
                  delete next.sort;
                  return next;
                });
              }
            }}
            placeholder="{ }"
            className={`font-mono text-sm min-h-[32px] max-h-[80px] resize-y py-1.5 px-2 ${
              optionErrors.sort ? "border-red-500 focus:border-red-500" : ""
            }`}
            rows={1}
          />
          {optionErrors.sort && (
            <p className="text-red-500 text-xs mt-0.5">{optionErrors.sort}</p>
          )}
        </div>

        {/* Skip */}
        <div className="w-[80px]">
          <div className="flex items-center gap-1 mb-1">
            <SkipForward className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Skip
            </span>
          </div>
          <Input
            type="number"
            min={0}
            value={localSkip}
            onChange={(e) => {
              setLocalSkip(e.target.value);
              if (optionErrors.skip) {
                setOptionErrors((prev) => {
                  const next = { ...prev };
                  delete next.skip;
                  return next;
                });
              }
            }}
            placeholder="0"
            className={`font-mono text-sm h-8 py-1 px-2 ${
              optionErrors.skip ? "border-red-500" : ""
            }`}
          />
          {optionErrors.skip && (
            <p className="text-red-500 text-xs mt-0.5">{optionErrors.skip}</p>
          )}
        </div>

        {/* Limit */}
        <div className="w-[90px]">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Limit
            </span>
          </div>
          <Select
            value={localLimit}
            onValueChange={(v) => setLocalLimit(v)}
          >
            <SelectTrigger className="h-8 text-xs font-mono bg-white">
              {localLimit}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="250">250</SelectItem>
              <SelectItem value="500">500</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Max Time */}
        <div className="w-[100px]">
          <div className="flex items-center gap-1 mb-1">
            <Timer className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Max Time
            </span>
          </div>
          <Input
            type="number"
            min={1}
            value={localMaxTime}
            onChange={(e) => {
              setLocalMaxTime(e.target.value);
              if (optionErrors.maxTimeMS) {
                setOptionErrors((prev) => {
                  const next = { ...prev };
                  delete next.maxTimeMS;
                  return next;
                });
              }
            }}
            placeholder="ms"
            className={`font-mono text-sm h-8 py-1 px-2 ${
              optionErrors.maxTimeMS ? "border-red-500" : ""
            }`}
          />
          {optionErrors.maxTimeMS && (
            <p className="text-red-500 text-xs mt-0.5">
              {optionErrors.maxTimeMS}
            </p>
          )}
        </div>
      </div>

      {/* Row 3: Actions + Pagination + View Toggle */}
      <div className="flex items-center justify-between pt-1">
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
          {/* Results info */}
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
              <span className="font-medium text-gray-900">
                {fields.length} fields
              </span>
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

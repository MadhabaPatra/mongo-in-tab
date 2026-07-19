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
  ChevronDown,
  List,
  LayoutGrid,
  Code2,
  Plus,
  Trash2,
  RotateCw,
  Clock,
  Download,
  Pencil,
  Sparkles,
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

  // Options panel visibility — Compass shows options inline under the query bar
  const [showOptions, setShowOptions] = useState(false);

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
    _key: string,
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
    <div className="space-y-0 rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* ── Top Query Bar ── */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* History dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-1.5 gap-0.5 text-muted-foreground hover:text-foreground"
            >
              <Clock className="h-3.5 w-3.5" />
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <div className="px-3 py-2 text-xs text-gray-400 text-center">
              No query history yet
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />

        {/* Generate query */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info("Query generation coming soon")}
          className="h-7 text-xs gap-1"
        >
          <Sparkles className="h-3.5 w-3.5 text-green-600" />
          Generate query
        </Button>

        {/* Reset */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={!hasActiveOptions}
          className="h-7 text-xs gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </Button>

        {/* Find — green */}
        <Button
          size="sm"
          onClick={handleFind}
          className="h-7 text-xs gap-1 bg-green-700 hover:bg-green-800 text-white"
        >
          <Play className="h-3 w-3" />
          Find
        </Button>

        {/* Export to Language */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info("Export to Language coming soon")}
          className="h-7 w-7 p-0"
        >
          <Code2 className="h-3.5 w-3.5" />
        </Button>

        {/* Options toggle */}
        <button
          type="button"
          onClick={() => setShowOptions((s) => !s)}
          className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 font-medium px-1.5 py-1 rounded hover:bg-blue-50 transition-colors"
        >
          Options
          <ChevronDown
            className={`h-3 w-3 transition-transform ${showOptions ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* ── Query input ── */}
      <div className="px-3 pb-2">
        <div className="relative">
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
            placeholder="Type a query: { field: 'value' }"
            className={`font-mono text-sm min-h-[32px] max-h-[120px] resize-y py-1.5 px-3 ${
              optionErrors.query || !queryValid
                ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                : "border-gray-200"
            }`}
            rows={1}
          />
        </div>
        {(optionErrors.query || !queryValid) && (
          <p className="text-red-500 text-xs mt-1">
            {optionErrors.query || "Invalid JSON query syntax"}
          </p>
        )}
      </div>

      {/* ── Options Panel ── */}
      {showOptions && (
        <div className="border-t border-gray-100 px-3 py-3 space-y-3">
          {/* Project */}
          <div className="flex items-start gap-3">
            <label className="w-28 shrink-0 pt-1.5 text-xs font-semibold text-foreground text-right">
              Project
            </label>
            <div className="flex-1">
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
                placeholder="{ field: 0 }"
                className={`font-mono text-sm min-h-[28px] max-h-[80px] resize-y py-1.5 px-3 ${
                  optionErrors.project ? "border-red-400 focus:border-red-400" : "border-gray-200"
                }`}
                rows={1}
              />
              {optionErrors.project && (
                <p className="text-red-500 text-xs mt-0.5">
                  {optionErrors.project}
                </p>
              )}
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-start gap-3">
            <label className="w-28 shrink-0 pt-1.5 text-xs font-semibold text-foreground text-right">
              Sort
            </label>
            <div className="flex-1">
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
                placeholder="{ field: -1 } or [['field', -1]]"
                className={`font-mono text-sm min-h-[28px] max-h-[80px] resize-y py-1.5 px-3 ${
                  optionErrors.sort ? "border-red-400 focus:border-red-400" : "border-gray-200"
                }`}
                rows={1}
              />
              {optionErrors.sort && (
                <p className="text-red-500 text-xs mt-0.5">
                  {optionErrors.sort}
                </p>
              )}
            </div>

            {/* Right side: Max Time MS */}
            <div className="w-40 shrink-0 flex items-start gap-2">
              <label className="text-xs font-semibold text-foreground pt-1.5 whitespace-nowrap">
                Max Time MS
              </label>
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
                placeholder="60000"
                className={`font-mono text-sm h-8 py-1 px-2 ${
                  optionErrors.maxTimeMS ? "border-red-400" : "border-gray-200"
                }`}
              />
            </div>
          </div>

          {/* Skip + Limit row */}
          <div className="flex items-start gap-3">
            <div className="w-28 shrink-0" />{/* spacer for label column */}
            <div className="flex-1" />
            <div className="flex items-start gap-4">
              <div className="w-28 shrink-0 flex items-start gap-2">
                <label className="text-xs font-semibold text-foreground pt-1.5 whitespace-nowrap">
                  Skip
                </label>
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
                    optionErrors.skip ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {optionErrors.skip && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {optionErrors.skip}
                  </p>
                )}
              </div>
              <div className="w-28 shrink-0 flex items-start gap-2">
                <label className="text-xs font-semibold text-foreground pt-1.5 whitespace-nowrap">
                  Limit
                </label>
                <Input
                  type="number"
                  min={1}
                  value={localLimit}
                  onChange={(e) => setLocalLimit(e.target.value)}
                  placeholder="0"
                  className="font-mono text-sm h-8 py-1 px-2 border-gray-200"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Action + Pagination Bar ── */}
      <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between bg-gray-50/50">
        {/* Left: Data actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => toast.info("Add Data coming soon")}
            className="h-7 gap-1.5 text-xs bg-green-700 hover:bg-green-800 text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            ADD DATA
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Export Data coming soon")}
            className="h-7 gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            EXPORT DATA
            <ChevronDown className="h-3 w-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Update coming soon")}
            className="h-7 gap-1.5 text-xs"
          >
            <Pencil className="h-3.5 w-3.5" />
            UPDATE
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Delete coming soon")}
            className="h-7 gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            DELETE
          </Button>
        </div>

        {/* Right: Pagination + View */}
        <div className="flex items-center gap-3">
          {/* Per page */}
          <Select
            value={limit.toString()}
            onValueChange={(v) => onLimitChange(Number.parseInt(v))}
          >
            <SelectTrigger className="h-7 text-xs w-[70px] bg-white border-gray-300 text-center justify-center font-mono">
              {limit}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="75">75</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>

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

          {/* Refresh */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-7 w-7 p-0"
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
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={isLastPage}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* View mode toggle — Compass icons */}
          <div className="flex items-center rounded-md border border-gray-300 overflow-hidden">
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs transition-colors ${
                viewMode === "table"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("json")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs transition-colors border-l border-gray-300 ${
                viewMode === "json"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="font-mono text-[10px] leading-none">{"{}"}</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("card")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs transition-colors border-l border-gray-300 ${
                viewMode === "card"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

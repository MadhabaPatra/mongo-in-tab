"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Plus, Minus, Edit3, GitCompare, List } from "lucide-react";

interface JsonChange {
  type: "added" | "removed" | "modified" | "unchanged";
  path: string;
  oldValue?: any;
  newValue?: any;
}

interface JsonDiffViewerProps {
  originalObj: any;
  modifiedObj: any;
  isLoading?: boolean;
}

export default function JsonDiffViewer({
  originalObj,
  modifiedObj,
  isLoading = false,
}: JsonDiffViewerProps) {
  const [activeTab, setActiveTab] = useState("field-wise");

  const changes = useMemo(() => {
    const generateChanges = (
      original: any,
      modified: any,
      path = "",
    ): JsonChange[] => {
      const changes: JsonChange[] = [];

      // Get all unique keys from both objects
      const originalKeys =
        original && typeof original === "object" ? Object.keys(original) : [];
      const modifiedKeys =
        modified && typeof modified === "object" ? Object.keys(modified) : [];
      const allKeys = Array.from(new Set([...originalKeys, ...modifiedKeys]));

      for (const key of allKeys) {
        if (key === "_id") continue;
        const currentPath = path ? `${path}.${key}` : key;
        const originalValue = original?.[key];
        const modifiedValue = modified?.[key];

        if (!(key in (original || {}))) {
          // Added field
          changes.push({
            type: "added",
            path: currentPath,
            newValue: modifiedValue,
          });
        } else if (!(key in (modified || {}))) {
          // Removed field
          changes.push({
            type: "removed",
            path: currentPath,
            oldValue: originalValue,
          });
        } else if (
          JSON.stringify(originalValue) !== JSON.stringify(modifiedValue)
        ) {
          // Modified field
          if (
            typeof originalValue === "object" &&
            typeof modifiedValue === "object" &&
            originalValue !== null &&
            modifiedValue !== null
          ) {
            // Recursively check nested objects
            changes.push(
              ...generateChanges(originalValue, modifiedValue, currentPath),
            );
          } else {
            changes.push({
              type: "modified",
              path: currentPath,
              oldValue: originalValue,
              newValue: modifiedValue,
            });
          }
        } else {
          // Unchanged field (for completeness)
          changes.push({
            type: "unchanged",
            path: currentPath,
            oldValue: originalValue,
            newValue: modifiedValue,
          });
        }
      }

      return changes;
    };

    return generateChanges(originalObj, modifiedObj);
  }, [originalObj, modifiedObj]);

  const generateLineDiff = useMemo(() => {
    // Normalize JSON by parsing and stringifying to ignore formatting
    const normalizeJson = (obj: any) => {
      try {
        return JSON.stringify(obj, Object.keys(obj).sort(), 2);
      } catch {
        return JSON.stringify(obj, null, 2);
      }
    };

    const originalLines = normalizeJson(originalObj).split("\n");
    const modifiedLines = normalizeJson(modifiedObj).split("\n");
    const maxLines = Math.max(originalLines.length, modifiedLines.length);

    const lineDiff = [];
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || "";
      const modifiedLine = modifiedLines[i] || "";

      // Ignore whitespace-only differences
      const normalizedOriginal = originalLine.trim();
      const normalizedModified = modifiedLine.trim();

      if (normalizedOriginal !== normalizedModified) {
        if (normalizedOriginal && !normalizedModified) {
          lineDiff.push({
            type: "removed",
            lineNumber: i + 1,
            content: originalLine,
          });
        } else if (!normalizedOriginal && normalizedModified) {
          lineDiff.push({
            type: "added",
            lineNumber: i + 1,
            content: modifiedLine,
          });
        } else {
          lineDiff.push({
            type: "modified",
            lineNumber: i + 1,
            originalContent: originalLine,
            modifiedContent: modifiedLine,
          });
        }
      }
    }
    return lineDiff;
  }, [originalObj, modifiedObj]);

  const significantChanges = useMemo(
    () => changes.filter((change) => change.type !== "unchanged"),
    [changes],
  );

  const getChangeIcon = (type: string) => {
    switch (type) {
      case "added":
        return <Plus className="h-3 w-3" />;
      case "removed":
        return <Minus className="h-3 w-3" />;
      case "modified":
        return <Edit3 className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getChangeBadgeVariant = (type: string) => {
    switch (type) {
      case "added":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "removed":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "modified":
        return "bg-orange-500/10 text-orange-700 border-orange-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card className="border-muted/40">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/30">
          <TabsTrigger value="field-wise" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Field-wise
          </TabsTrigger>
          <TabsTrigger value="line-by-line" className="flex items-center gap-2">
            <GitCompare className="h-4 w-4" />
            Line-by-line
          </TabsTrigger>
        </TabsList>

        <TabsContent value="field-wise" className="space-y-4">
          <Card className="border-muted/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Field Changes ({significantChanges.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {significantChanges.length === 0 ? (
                <div className="text-sm text-muted-foreground bg-muted/30 rounded-md p-3 border border-muted/40">
                  No field changes detected
                </div>
              ) : (
                <div className="space-y-3">
                  {significantChanges.map((change, index) => (
                    <div
                      key={index}
                      className="border border-muted/40 rounded-md p-3 bg-muted/20"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          className={`text-xs font-medium ${getChangeBadgeVariant(change.type)}`}
                        >
                          {getChangeIcon(change.type)}
                          {change.type.toUpperCase()}
                        </Badge>
                        <code className="text-sm font-mono text-primary bg-background px-2 py-1 rounded border">
                          {change.path}
                        </code>
                      </div>

                      <div className="space-y-2 text-xs font-mono">
                        {change.type === "added" && (
                          <div className="bg-green-500/10 border border-green-200 rounded p-2">
                            <div className="flex items-start gap-2">
                              <span className="text-green-600 font-bold">
                                +
                              </span>
                              <code className="text-green-800 break-all">
                                {JSON.stringify(change.newValue, null, 2)}
                              </code>
                            </div>
                          </div>
                        )}
                        {change.type === "removed" && (
                          <div className="bg-red-500/10 border border-red-200 rounded p-2">
                            <div className="flex items-start gap-2">
                              <span className="text-red-600 font-bold">-</span>
                              <code className="text-red-800 break-all">
                                {JSON.stringify(change.oldValue, null, 2)}
                              </code>
                            </div>
                          </div>
                        )}
                        {change.type === "modified" && (
                          <div className="space-y-1">
                            <div className="bg-red-500/10 border border-red-200 rounded p-2">
                              <div className="flex items-start gap-2">
                                <span className="text-red-600 font-bold">
                                  -
                                </span>
                                <code className="text-red-800 break-all">
                                  {JSON.stringify(change.oldValue, null, 2)}
                                </code>
                              </div>
                            </div>
                            <div className="bg-green-500/10 border border-green-200 rounded p-2">
                              <div className="flex items-start gap-2">
                                <span className="text-green-600 font-bold">
                                  +
                                </span>
                                <code className="text-green-800 break-all">
                                  {JSON.stringify(change.newValue, null, 2)}
                                </code>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="line-by-line" className="space-y-4">
          <Card className="border-muted/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <GitCompare className="h-4 w-4 text-primary" />
                Line-by-line Comparison ({generateLineDiff.length} changes)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {generateLineDiff.length === 0 ? (
                <div className="text-sm text-muted-foreground bg-muted/30 rounded-md p-3 border border-muted/40">
                  No line differences detected
                </div>
              ) : (
                <div className="bg-background border border-muted/40 rounded-md overflow-hidden">
                  <div className="max-h-96 overflow-auto">
                    {generateLineDiff.map((diff, index) => (
                      <div
                        key={index}
                        className="border-b border-muted/20 last:border-b-0"
                      >
                        {diff.type === "removed" && (
                          <div className="bg-red-500/5 px-4 py-2 flex items-start gap-3">
                            <span className="text-xs text-muted-foreground font-mono w-8 text-right">
                              {diff.lineNumber}
                            </span>
                            <span className="text-red-600 font-bold">-</span>
                            <code className="text-xs font-mono text-red-800 flex-1 break-all">
                              {diff.content}
                            </code>
                          </div>
                        )}
                        {diff.type === "added" && (
                          <div className="bg-green-500/5 px-4 py-2 flex items-start gap-3">
                            <span className="text-xs text-muted-foreground font-mono w-8 text-right">
                              {diff.lineNumber}
                            </span>
                            <span className="text-green-600 font-bold">+</span>
                            <code className="text-xs font-mono text-green-800 flex-1 break-all">
                              {diff.content}
                            </code>
                          </div>
                        )}
                        {diff.type === "modified" && (
                          <div>
                            <div className="bg-red-500/5 px-4 py-2 flex items-start gap-3">
                              <span className="text-xs text-muted-foreground font-mono w-8 text-right">
                                {diff.lineNumber}
                              </span>
                              <span className="text-red-600 font-bold">-</span>
                              <code className="text-xs font-mono text-red-800 flex-1 break-all">
                                {diff.originalContent}
                              </code>
                            </div>
                            <div className="bg-green-500/5 px-4 py-2 flex items-start gap-3">
                              <span className="text-xs text-muted-foreground font-mono w-8 text-right">
                                {diff.lineNumber}
                              </span>
                              <span className="text-green-600 font-bold">
                                +
                              </span>
                              <code className="text-xs font-mono text-green-800 flex-1 break-all">
                                {diff.modifiedContent}
                              </code>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Side-by-side JSON view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-muted/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Original Document
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-muted/20 border border-muted/40 rounded-md p-4 h-64 overflow-auto">
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(originalObj, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Modified Document
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-muted/20 border border-muted/40 rounded-md p-4 h-64 overflow-auto">
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(modifiedObj, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

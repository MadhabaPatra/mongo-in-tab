"use client";

import type React from "react";
import { useState, useMemo, useEffect } from "react";
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
          changes.push({
            type: "added",
            path: currentPath,
            newValue: modifiedValue,
          });
        } else if (!(key in (modified || {}))) {
          changes.push({
            type: "removed",
            path: currentPath,
            oldValue: originalValue,
          });
        } else if (
          JSON.stringify(originalValue) !== JSON.stringify(modifiedValue)
        ) {
          if (
            typeof originalValue === "object" &&
            typeof modifiedValue === "object" &&
            originalValue !== null &&
            modifiedValue !== null
          ) {
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
        }
      }

      return changes;
    };

    return generateChanges(originalObj, modifiedObj);
  }, [originalObj, modifiedObj]);

  const significantChanges = useMemo(
    () => changes.filter((change) => change.type !== "unchanged"),
    [changes],
  );

  // Switch away from side-by-side if no changes exist
  useEffect(() => {
    if (activeTab === "side-by-side" && significantChanges.length === 0) {
      setActiveTab("field-wise");
    }
  }, [activeTab, significantChanges.length]);

  const generateLineDiff = useMemo(() => {
    // Remove _id from both objects for comparison
    const cleanOriginal = { ...originalObj };
    const cleanModified = { ...modifiedObj };
    delete cleanOriginal._id;
    delete cleanModified._id;

    const normalizeJson = (obj: any) => {
      try {
        return JSON.stringify(obj, Object.keys(obj).sort(), 2);
      } catch {
        return JSON.stringify(obj, null, 2);
      }
    };

    const originalLines = normalizeJson(cleanOriginal).split("\n");
    const modifiedLines = normalizeJson(cleanModified).split("\n");
    const maxLines = Math.max(originalLines.length, modifiedLines.length);

    const lineDiff = [];
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || "";
      const modifiedLine = modifiedLines[i] || "";

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

  const getChangeIcon = (type: string) => {
    switch (type) {
      case "added":
        return <Plus className="h-4 w-4" />;
      case "removed":
        return <Minus className="h-4 w-4" />;
      case "modified":
        return <Edit3 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getChangeBadgeClass = (type: string) => {
    switch (type) {
      case "added":
        return "bg-green-50 text-green-700 border-green-200";
      case "removed":
        return "bg-red-50 text-red-700 border-red-200";
      case "modified":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="field-wise" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Field Changes
          </TabsTrigger>
          <TabsTrigger value="line-by-line" className="flex items-center gap-2">
            <GitCompare className="h-4 w-4" />
            Line Diff
          </TabsTrigger>
          <TabsTrigger value="side-by-side" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Side by Side
          </TabsTrigger>
        </TabsList>

        <TabsContent value="field-wise">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Changes ({significantChanges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {significantChanges.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No changes detected
                </div>
              ) : (
                <div className="space-y-4">
                  {significantChanges.map((change, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <Badge className={getChangeBadgeClass(change.type)}>
                          {getChangeIcon(change.type)}
                          {change.type.toUpperCase()}
                        </Badge>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {change.path}
                        </code>
                      </div>

                      {change.type === "added" && (
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <div className="flex gap-2">
                            <span className="text-green-600 font-bold">+</span>
                            <code className="text-sm text-green-800 break-all">
                              {JSON.stringify(change.newValue, null, 2)}
                            </code>
                          </div>
                        </div>
                      )}

                      {change.type === "removed" && (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <div className="flex gap-2">
                            <span className="text-red-600 font-bold">-</span>
                            <code className="text-sm text-red-800 break-all">
                              {JSON.stringify(change.oldValue, null, 2)}
                            </code>
                          </div>
                        </div>
                      )}

                      {change.type === "modified" && (
                        <div className="space-y-2">
                          <div className="bg-red-50 border border-red-200 rounded p-3">
                            <div className="flex gap-2">
                              <span className="text-red-600 font-bold">-</span>
                              <code className="text-sm text-red-800 break-all">
                                {JSON.stringify(change.oldValue, null, 2)}
                              </code>
                            </div>
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded p-3">
                            <div className="flex gap-2">
                              <span className="text-green-600 font-bold">
                                +
                              </span>
                              <code className="text-sm text-green-800 break-all">
                                {JSON.stringify(change.newValue, null, 2)}
                              </code>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="line-by-line">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                Line Changes ({generateLineDiff.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generateLineDiff.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No line differences detected
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-auto">
                    {generateLineDiff.map((diff, index) => (
                      <div
                        key={index}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        {diff.type === "removed" && (
                          <div className="bg-red-50 px-4 py-2 flex items-start gap-3">
                            <span className="text-xs text-gray-500 font-mono w-8 text-right">
                              {diff.lineNumber}
                            </span>
                            <span className="text-red-600 font-bold">-</span>
                            <code className="text-sm font-mono text-red-800 flex-1">
                              {diff.content}
                            </code>
                          </div>
                        )}
                        {diff.type === "added" && (
                          <div className="bg-green-50 px-4 py-2 flex items-start gap-3">
                            <span className="text-xs text-gray-500 font-mono w-8 text-right">
                              {diff.lineNumber}
                            </span>
                            <span className="text-green-600 font-bold">+</span>
                            <code className="text-sm font-mono text-green-800 flex-1">
                              {diff.content}
                            </code>
                          </div>
                        )}
                        {diff.type === "modified" && (
                          <div>
                            <div className="bg-red-50 px-4 py-2 flex items-start gap-3">
                              <span className="text-xs text-gray-500 font-mono w-8 text-right">
                                {diff.lineNumber}
                              </span>
                              <span className="text-red-600 font-bold">-</span>
                              <code className="text-sm font-mono text-red-800 flex-1">
                                {diff.originalContent}
                              </code>
                            </div>
                            <div className="bg-green-50 px-4 py-2 flex items-start gap-3">
                              <span className="text-xs text-gray-500 font-mono w-8 text-right">
                                {diff.lineNumber}
                              </span>
                              <span className="text-green-600 font-bold">
                                +
                              </span>
                              <code className="text-sm font-mono text-green-800 flex-1">
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

        {significantChanges.length > 0 && (
          <TabsContent value="side-by-side">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Original</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded p-4 h-96 overflow-auto">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      {JSON.stringify(
                        Object.fromEntries(
                          Object.entries(originalObj).filter(
                            ([key]) => key !== "_id",
                          ),
                        ),
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Modified</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded p-4 h-96 overflow-auto">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      {JSON.stringify(modifiedObj, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

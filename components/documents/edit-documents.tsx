"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Save, Eye, ArrowLeft, Code } from "lucide-react";

interface EditDocumentProps {
  document: IDocument;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedDocument: any) => void;
}

type ViewMode = "json" | "table" | "review";

interface JsonChange {
  path: string;
  type: "added" | "modified" | "removed";
  oldValue?: any;
  newValue?: any;
}

export default function EditDocument({
  document,
  isOpen,
  onClose,
  onSave,
}: EditDocumentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("json");
  const [editedJson, setEditedJson] = useState(
    JSON.stringify(document, null, 2),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateJson = (jsonString: string) => {
    try {
      JSON.parse(jsonString);
      setJsonError(null);
      return true;
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "Invalid JSON");
      return false;
    }
  };

  const handleJsonChange = (value: string) => {
    setEditedJson(value);
    validateJson(value);
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(editedJson);
      const formatted = JSON.stringify(parsed, null, 2);
      setEditedJson(formatted);
      setJsonError(null);
    } catch (error) {
      // If JSON is invalid, don't format
    }
  };

  const getJsonChanges = (
    original: any,
    modified: any,
    path = "",
  ): JsonChange[] => {
    const changes: JsonChange[] = [];

    const originalKeys =
      original && typeof original === "object" ? Object.keys(original) : [];
    const modifiedKeys =
      modified && typeof modified === "object" ? Object.keys(modified) : [];
    const allKeys = new Set([...originalKeys, ...modifiedKeys]);

    // Handle primitive values or null
    if (
      typeof original !== "object" ||
      typeof modified !== "object" ||
      original === null ||
      modified === null
    ) {
      if (JSON.stringify(original) !== JSON.stringify(modified)) {
        changes.push({
          path: path || "root",
          type: "modified",
          oldValue: original,
          newValue: modified,
        });
      }
      return changes;
    }

    // Handle object/array changes
    for (const key of Array.from(allKeys)) {
      const currentPath = path ? `${path}.${key}` : key;
      const originalValue = original[key];
      const modifiedValue = modified[key];

      if (!(key in original)) {
        changes.push({
          path: currentPath,
          type: "added",
          newValue: modifiedValue,
        });
      } else if (!(key in modified)) {
        changes.push({
          path: currentPath,
          type: "removed",
          oldValue: originalValue,
        });
      } else if (
        typeof originalValue === "object" &&
        typeof modifiedValue === "object" &&
        originalValue !== null &&
        modifiedValue !== null
      ) {
        changes.push(
          ...getJsonChanges(originalValue, modifiedValue, currentPath),
        );
      } else if (
        JSON.stringify(originalValue) !== JSON.stringify(modifiedValue)
      ) {
        changes.push({
          path: currentPath,
          type: "modified",
          oldValue: originalValue,
          newValue: modifiedValue,
        });
      }
    }

    return changes;
  };

  const handleSave = () => {
    if (validateJson(editedJson)) {
      const updatedDocument = JSON.parse(editedJson);
      onSave(updatedDocument);
      onClose();
    }
  };

  const handleReviewAndSave = () => {
    if (validateJson(editedJson)) {
      setViewMode("review");
    }
  };

  const handleConfirmSave = () => {
    const updatedDocument = JSON.parse(editedJson);
    onSave(updatedDocument);
    onClose();
  };

  const renderJsonDiff = () => {
    try {
      const originalObj = document;
      const modifiedObj = JSON.parse(editedJson);
      const changes = getJsonChanges(originalObj, modifiedObj);

      return (
        <div className="space-y-4">
          {/* Changes Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              Changes Summary
            </h4>
            {changes.length === 0 ? (
              <p className="text-blue-600 text-sm">
                No actual changes detected (only formatting differences)
              </p>
            ) : (
              <div className="space-y-1">
                {changes.map((change, index) => (
                  <div key={index} className="text-sm">
                    <span
                      className={`inline-block w-16 text-xs px-2 py-1 rounded mr-2 ${
                        change.type === "added"
                          ? "bg-green-100 text-green-800"
                          : change.type === "removed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {change.type.toUpperCase()}
                    </span>
                    <span className="font-mono text-blue-700">
                      {change.path}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side-by-side comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700">Original</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 h-96 overflow-auto">
                <pre className="text-sm font-json whitespace-pre-wrap">
                  {JSON.stringify(originalObj, null, 2)}
                </pre>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700">Modified</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 h-96 overflow-auto">
                <pre className="text-sm font-json whitespace-pre-wrap">
                  {editedJson}
                </pre>
              </div>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="text-red-600 p-4">
          Error comparing JSON:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-white/20 backdrop-blur-sm">
      <div className="flex-1" onClick={onClose} />
      <div className="w-2/3 bg-white shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {viewMode === "review" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("json")}
                  className="cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Edit
                </Button>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {viewMode === "review" ? "Review Changes" : "Edit Document"}
                </h3>
                <p className="text-sm text-gray-600 font-json">
                  {document?._id}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mode Tabs */}
          {viewMode !== "review" && (
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant={viewMode === "json" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("json")}
                className="cursor-pointer"
              >
                JSON Mode
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="cursor-pointer"
                disabled
              >
                Table Mode
                <Badge variant="secondary" className="ml-2 text-xs">
                  Dev
                </Badge>
              </Button>
              {viewMode === "json" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFormatJson}
                  className="cursor-pointer ml-auto bg-transparent"
                  disabled={!!jsonError}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Format
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === "json" && (
            <div className="h-full flex flex-col">
              <div className="flex-1 p-4">
                <textarea
                  value={editedJson}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  className="w-full h-full p-4 border rounded-lg font-json text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Edit JSON here..."
                />
                {jsonError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                    {jsonError}
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode === "table" && (
            <div className="h-full flex items-center justify-center p-8">
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">🚧</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Table Mode
                  </h3>
                  <p className="text-gray-600">
                    This feature is currently in development.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {viewMode === "review" && (
            <div className="h-full p-4 overflow-auto">{renderJsonDiff()}</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-end gap-2">
            {viewMode === "json" && (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="cursor-pointer bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!!jsonError}
                  className="cursor-pointer"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={handleReviewAndSave}
                  disabled={!!jsonError}
                  className="cursor-pointer"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Review & Save
                </Button>
              </>
            )}
            {viewMode === "review" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setViewMode("json")}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button onClick={handleConfirmSave} className="cursor-pointer">
                  <Save className="h-4 w-4 mr-2" />
                  Confirm Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

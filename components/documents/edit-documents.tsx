"use client";

import { useState } from "react";
import {
  X,
  Save,
  Eye,
  ArrowLeft,
  Code,
  AlertCircle,
  CheckCircle2,
  FileEdit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import JsonDiffViewer from "@/components/documents/json-diff-viewer";
import { StorageManager } from "@/lib/storage";
import { saveADocument } from "@/lib/mongodb";
import JsonEditor from "@/components/ui/json-editor";
import { TableViewPlaceholder } from "@/components/ui/table-editor";

// Types
interface EditDocumentProps {
  connectionId: string;
  database: string;
  collectionName: string;
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
  connectionId,
  database,
  collectionName,
  document,
  isOpen,
  onClose,
  onSave,
}: EditDocumentProps) {
  // All hooks must be called before any early returns
  const [viewMode, setViewMode] = useState<ViewMode>("json");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const document_without_id = JSON.parse(JSON.stringify(document));
  document_without_id._id = undefined;

  const [editedJson, setEditedJson] = useState(
    JSON.stringify(document_without_id, null, 2),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Early return AFTER all hooks
  if (!isOpen) return null;

  const handleJsonChange = (value: string) => {
    setEditedJson(value);
    validateJson(value);
  };

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

  const formatJson = () => {
    try {
      const parsed = JSON.parse(editedJson);
      const formatted = JSON.stringify(parsed, null, 2);
      setEditedJson(formatted);
      setJsonError(null);
    } catch (error) {
      console.warn("Cannot format invalid JSON");
    }
  };

  const handleSaveDocument = async () => {
    if (jsonError) {
      toast.error("Please fix JSON errors before saving");
      return;
    }

    try {
      setIsLoading(true);

      if (!connectionId) {
        toast.error("Connection ID is missing");
        return;
      }

      const connectionData: IConnection | undefined =
        StorageManager.getConnectionDetails(connectionId);

      if (!connectionData?.url) {
        toast.error("Invalid connection ID entered");
        return;
      }

      const updatedDocument = JSON.parse(editedJson);

      const response = await saveADocument(
        connectionData.url,
        database,
        collectionName,
        document._id,
        updatedDocument,
      );

      if (response?.success) {
        toast.success("Document saved successfully");
        onSave({ ...updatedDocument, _id: document._id });
        onClose();
      } else {
        const errorMessage = response?.message || "Unknown error occurred";
        toast.error(`Failed to save document: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Save document error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to save document: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewAndSave = () => {
    if (validateJson(editedJson)) {
      setViewMode("review");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="ml-auto relative bg-white w-full max-w-4xl h-full shadow-2xl border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="shrink-0 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileEdit className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {viewMode === "review" ? "Review Changes" : "Edit Document"}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      ID: {document?._id}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mode Tabs & Actions */}
          {viewMode !== "review" && (
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "json" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("json")}
                    className="h-9"
                  >
                    JSON Editor
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="h-9"
                  >
                    Table View
                  </Button>
                </div>

                {viewMode === "json" && (
                  <div className="flex items-center gap-2">
                    {jsonError && (
                      <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">JSON Error</span>
                      </div>
                    )}
                    {!jsonError && editedJson.trim() && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-md">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Valid JSON</span>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={formatJson}
                      disabled={!!jsonError}
                      className="h-9"
                    >
                      <Code className="h-4 w-4 mr-2" />
                      Format
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {jsonError && (
          <div className="shrink-0 bg-red-50 border-b border-red-200 px-6 py-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  JSON Syntax Error
                </p>
                <p className="text-sm text-red-700 mt-1">{jsonError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden bg-gray-50/30">
          {/* JSON Editor */}
          {viewMode === "json" && (
            <div className="h-full">
              <JsonEditor
                value={editedJson}
                onChange={handleJsonChange}
                error={jsonError}
              />
            </div>
          )}

          {/* Table Editor */}
          {viewMode === "table" && (
            <div className="h-full p-6 flex items-center justify-center">
              <TableViewPlaceholder />
            </div>
          )}

          {/* Review Mode */}
          {viewMode === "review" && (
            <div className="h-full">
              <div className="p-6">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">
                      Changes Preview
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Review your modifications before saving
                    </p>
                  </div>
                  <div className="overflow-auto max-h-[calc(100vh-300px)]">
                    <JsonDiffViewer
                      originalObj={document}
                      modifiedObj={JSON.parse(editedJson)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-white border-t border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {viewMode === "json" && !jsonError && (
                <span>Document is ready to save</span>
              )}
              {viewMode === "review" && (
                <span>Review completed • Ready to save changes</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {viewMode === "json" && (
                <>
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSaveDocument}
                    disabled={!!jsonError || isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    onClick={handleReviewAndSave}
                    disabled={!!jsonError || isLoading}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review & Save
                  </Button>
                </>
              )}

              {viewMode === "review" && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setViewMode("json")}
                    disabled={isLoading}
                  >
                    Back to Edit
                  </Button>
                  <Button onClick={handleSaveDocument} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Confirm Save"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

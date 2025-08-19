"use client";

import { useState } from "react";
import { X, Save, Eye, ArrowLeft, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

interface DocumentHeaderProps {
  viewMode: ViewMode;
  document: IDocument;
  onClose: () => void;
  onBack: () => void;
}

interface ModeTabsProps {
  viewMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onFormatJson: () => void;
  hasJsonError: boolean;
}

interface DocumentFooterProps {
  viewMode: ViewMode;
  onClose: () => void;
  onSave: () => void;
  onReviewAndSave: () => void;
  onBackToEdit: () => void;
  hasJsonError: boolean;
  isLoading: boolean;
}

const DocumentHeader = ({
  viewMode,
  document,
  onClose,
  onBack,
}: DocumentHeaderProps) => (
  <div className="p-4 border-b bg-gray-50">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {viewMode === "review" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
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
          <p className="text-sm text-gray-600 font-json">{document?._id}</p>
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
  </div>
);

// Mode Tabs Component
const ModeTabs = ({
  viewMode,
  onModeChange,
  onFormatJson,
  hasJsonError,
}: ModeTabsProps) => {
  if (viewMode === "review") return null;

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === "json" ? "default" : "outline"}
          size="sm"
          onClick={() => onModeChange("json")}
          className="cursor-pointer"
        >
          JSON Mode
        </Button>
        <Button
          variant={viewMode === "table" ? "default" : "outline"}
          size="sm"
          onClick={() => onModeChange("table")}
          className="cursor-pointer"
        >
          Table Mode
        </Button>
        {viewMode === "json" && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFormatJson}
            className="cursor-pointer ml-auto bg-transparent"
            disabled={hasJsonError}
          >
            <Code className="h-4 w-4 mr-2" />
            Format
          </Button>
        )}
      </div>
    </div>
  );
};

const DocumentFooter = ({
  viewMode,
  onClose,
  onSave,
  onReviewAndSave,
  onBackToEdit,
  hasJsonError,
  isLoading,
}: DocumentFooterProps) => (
  <div className="p-4 border-t bg-gray-50">
    <div className="flex items-center justify-end gap-2">
      {viewMode === "json" && (
        <>
          <Button
            variant="outline"
            onClick={onClose}
            className="cursor-pointer bg-transparent"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={onSave}
            disabled={hasJsonError || isLoading}
            className="cursor-pointer"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={onReviewAndSave}
            disabled={hasJsonError || isLoading}
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
            onClick={onBackToEdit}
            className="cursor-pointer"
            disabled={isLoading}
          >
            Back to Edit
          </Button>
          <Button
            onClick={onSave}
            className="cursor-pointer"
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Confirm Save"}
          </Button>
        </>
      )}
    </div>
  </div>
);

export default function EditDocument({
  connectionId,
  database,
  collectionName,
  document,
  isOpen,
  onClose,
  onSave,
}: EditDocumentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("json");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Early return if modal is not open
  if (!isOpen) return null;

  const document_without_id = JSON.parse(JSON.stringify(document));
  document_without_id._id = undefined;

  const [editedJson, setEditedJson] = useState(
    JSON.stringify(document_without_id, null, 2),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

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
      // If JSON is invalid, don't format
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

      // Validate connection
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

      // Parse and save the updated document
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
    <div className="fixed inset-0 z-50 flex bg-white/20 backdrop-blur-sm">
      <div className="flex-1" onClick={onClose} />
      <div className="w-2/3 bg-white shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <DocumentHeader
          viewMode={viewMode}
          document={document}
          onClose={onClose}
          onBack={() => {
            setViewMode("json");
          }}
        />

        {/* Content */}
        <ModeTabs
          viewMode={viewMode}
          onModeChange={setViewMode}
          onFormatJson={formatJson}
          hasJsonError={!!jsonError}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {/* JSON Editor*/}
          {viewMode === "json" && (
            <JsonEditor
              value={editedJson}
              onChange={handleJsonChange}
              error={jsonError}
            />
          )}

          {/* Table Editor*/}
          {viewMode === "table" && <TableViewPlaceholder />}

          {/* Table Editor*/}
          {viewMode === "review" && (
            <div className="h-full p-4 overflow-auto">
              <JsonDiffViewer
                originalObj={document}
                modifiedObj={JSON.parse(editedJson)}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DocumentFooter
          viewMode={viewMode}
          onClose={onClose}
          onSave={handleSaveDocument}
          onReviewAndSave={handleReviewAndSave}
          onBackToEdit={() => {
            setViewMode("json");
          }}
          hasJsonError={!!jsonError}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

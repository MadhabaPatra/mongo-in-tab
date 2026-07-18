"use client";

import { Button } from "@/components/ui/button";
import { Copy, Edit, FileText, Hash, X, Database, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { copyToClipboard, getFieldType, getEJSONValue } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import EditDocument from "@/components/documents/edit-documents";

interface DocumentsCardViewProps {
  connectionId: string;
  database: string;
  collectionName: string;
  fields: string[];
  documents: IDocument[];
  onLoadDocuments: () => void;
}

export function DocumentsCardView({
  connectionId,
  database,
  collectionName,
  fields,
  documents,
  onLoadDocuments,
}: DocumentsCardViewProps) {
  const [sidebarDocument, setSidebarDocument] = useState<IDocument | null>(
    null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editDocumentOpen, setEditDocumentOpen] = useState(false);

  const handleOpenJsonSidebar = (doc: IDocument) => {
    setSidebarDocument(doc);
    setSidebarOpen(true);
  };

  const handleEditDocument = (doc: IDocument) => {
    setSidebarDocument(doc);
    setEditDocumentOpen(true);
  };

  const renderCellValue = (value: any, field: string) => {
    const fieldType = getFieldType(value);

    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic text-sm">null</span>;
    }

    // Extract plain value from EJSON
    const displayValue = getEJSONValue(value);

    if (typeof displayValue === "boolean") {
      return (
        <span
          className={`font-medium text-sm px-2 py-1 rounded-full ${
            displayValue ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {displayValue.toString()}
        </span>
      );
    }

    if (typeof displayValue === "string") {
      if (fieldType === "objectid") {
        return (
          <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
            {displayValue.length > 20
              ? `${displayValue.slice(0, 8)}...${displayValue.slice(-8)}`
              : displayValue}
          </span>
        );
      }
      if (fieldType === "date") {
        return (
          <span className="text-green-600 text-sm">
            {new Date(displayValue).toLocaleString()}
          </span>
        );
      }

      const isLongText = displayValue.length > 30;
      const truncated = isLongText
        ? displayValue.slice(0, 30) + "..."
        : displayValue;

      return <span className="text-sm text-gray-700">{truncated}</span>;
    }

    if (typeof displayValue === "number") {
      return <span className="font-mono text-sm text-gray-700">{displayValue}</span>;
    }

    if (Array.isArray(displayValue)) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
            Array[{displayValue.length}]
          </span>
        </div>
      );
    }

    if (displayValue !== null && typeof displayValue === "object") {
      const keys = Object.keys(displayValue);
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
            Object[{keys.length}]
          </span>
        </div>
      );
    }

    return (
      <span className="font-mono text-sm text-gray-700">{String(displayValue)}</span>
    );
  };

  // Get the most important fields to display prominently
  const getKeyFields = (doc: IDocument) => {
    const keyFields: string[] = [];

    const priorityFields = [
      "name",
      "title",
      "email",
      "username",
      "status",
      "type",
    ];

    for (const field of priorityFields) {
      if (doc[field] !== undefined && doc[field] !== null) {
        keyFields.push(field);
        if (keyFields.length >= 2) break;
      }
    }

    // If we don't have enough priority fields, add others
    for (const field of fields) {
      if (!keyFields.includes(field) && keyFields.length < 3) {
        keyFields.push(field);
      }
    }

    return keyFields;
  };

  return (
    <div className="space-y-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {documents.map((doc, index) => {
          const keyFields = getKeyFields(doc);

          return (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => handleOpenJsonSidebar(doc)}
            >
              {/* Card Header */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditDocument(doc);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit document</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenJsonSidebar(doc);
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View JSON</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* Document ID */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <code
                        className="text-xs font-mono text-gray-600 cursor-pointer hover:text-blue-600 transition-colors mt-1 block"
                        onClick={(e) => {
                          e.stopPropagation();
                          const id = String(getEJSONValue(doc._id) ?? "");
                          if (id) {
                            copyToClipboard(id);
                            toast.success("Document ID copied");
                          }
                        }}
                      >
                        {String(getEJSONValue(doc._id) ?? "").slice(0, 8)}...{String(getEJSONValue(doc._id) ?? "").slice(-4)}
                      </code>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to copy ID</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-3">
                {/* Key Fields */}
                {keyFields.map((field) => (
                  <div key={field} className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {field}
                    </label>
                    <div className="min-h-[20px]">
                      {renderCellValue(doc[field], field)}
                    </div>
                  </div>
                ))}

                {/* Additional fields indicator */}
                {fields.length > keyFields.length && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      +{fields.length - keyFields.length} more fields
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="text-center py-12">
          <Database className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No documents found
          </h3>
          <p className="text-gray-500">This collection appears to be empty.</p>
        </div>
      )}

      {/* JSON Viewer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div className="ml-auto relative bg-white w-full max-w-2xl h-full shadow-2xl border-l border-gray-200 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">
                  Document JSON
                </h2>
                <p className="text-sm text-gray-600 mt-1 font-mono">
                  ID: {String(getEJSONValue(sidebarDocument?._id) ?? "")}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    copyToClipboard(JSON.stringify(sidebarDocument, null, 2));
                    toast.success("JSON copied to clipboard");
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditDocument(sidebarDocument!)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100">
                <pre className="text-sm font-mono whitespace-pre-wrap text-gray-800 leading-6">
                  {JSON.stringify(sidebarDocument, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {sidebarDocument && (
        <EditDocument
          document={sidebarDocument}
          connectionId={connectionId}
          database={database}
          collectionName={collectionName}
          isOpen={editDocumentOpen}
          onClose={() => {
            setSidebarDocument(null);
            setSidebarOpen(false);
            setEditDocumentOpen(false);
          }}
          onSave={(updatedDocument: any) => {
            setSidebarDocument(null);
            setEditDocumentOpen(false);
            onLoadDocuments();
          }}
        />
      )}
    </div>
  );
}

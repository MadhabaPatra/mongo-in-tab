"use client";

import { Button } from "@/components/ui/button";
import { Copy, Edit, X, Database, Eye, ChevronRight, ChevronDown, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { copyToClipboard, getEJSONValue } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import EditDocument from "@/components/documents/edit-documents";
import { DocumentCompactTree } from "./document-compact-tree";
import { JsonTree } from "./json-tree";

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
  documents,
  onLoadDocuments,
}: DocumentsCardViewProps) {
  const [sidebarDocument, setSidebarDocument] = useState<IDocument | null>(
    null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editDocumentOpen, setEditDocumentOpen] = useState(false);
  const [collapsedCards, setCollapsedCards] = useState<Set<number>>(new Set());

  const handleOpenJsonSidebar = (doc: IDocument) => {
    setSidebarDocument(doc);
    setSidebarOpen(true);
  };

  const handleEditDocument = (doc: IDocument) => {
    setSidebarDocument(doc);
    setEditDocumentOpen(true);
  };

  const toggleCard = (index: number) => {
    setCollapsedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {documents.map((doc, index) => {
          const isCollapsed = collapsedCards.has(index);
          const docKeys = Object.keys(doc);

          return (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 group"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCard(index)}
                    className="shrink-0 inline-flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <span className="text-[10px] text-gray-400 font-mono">
                    #{index + 1}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDocument(doc);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(JSON.stringify(doc, null, 2));
                            toast.success("Document copied to clipboard");
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info("Delete coming soon");
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenJsonSidebar(doc);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>JSON</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Body — full tree or compact summary */}
              {isCollapsed ? (
                <div className="px-3 py-2 font-mono text-xs text-gray-500">
                  {String(getEJSONValue(doc._id) ?? "").slice(0, 8)}...{String(getEJSONValue(doc._id) ?? "").slice(-4)}
                  <span className="text-gray-400 ml-2">
                    {docKeys.length} fields
                  </span>
                </div>
              ) : (
                <div className="px-3 py-2">
                  <DocumentCompactTree data={doc} />
                </div>
              )}
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
                <JsonTree data={sidebarDocument} />
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

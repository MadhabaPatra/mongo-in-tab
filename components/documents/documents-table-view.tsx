"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Hash, X } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { copyToClipboard, getFieldTypeDisplayName, getEJSONValue } from "@/lib/utils";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import EditDocument from "@/components/documents/edit-documents";

interface DocumentsTableViewProps {
  connectionId: string;
  database: string;
  collectionName: string;
  fields: string[];
  documents: IDocument[];
  onLoadDocuments: () => void;
}

export function DocumentsTableView({
  connectionId,
  database,
  collectionName,
  fields,
  documents,
  onLoadDocuments,
}: DocumentsTableViewProps) {
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

  // Infer BSON type for each column by scanning visible documents
  const fieldTypes = useMemo(() => {
    const types = new Map<string, string>();
    for (const field of fields) {
      const seen = new Set<string>();
      let hasValue = false;
      for (const doc of documents) {
        const value = doc[field];
        if (value !== null && value !== undefined) {
          hasValue = true;
          seen.add(getFieldTypeDisplayName(value));
          if (seen.size > 1) break;
        }
      }
      types.set(field, hasValue ? (seen.size > 1 ? "Mixed" : seen.values().next().value!) : "Null");
    }
    return types;
  }, [documents, fields]);

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic text-sm">null</span>;
    }

    // Extract plain value from EJSON (e.g. { $oid: "..." } → "...")
    const displayValue = getEJSONValue(value);

    if (typeof displayValue === "boolean") {
      return (
        <span
          className={`font-medium text-sm ${displayValue ? "text-green-600" : "text-red-600"}`}
        >
          {displayValue.toString()}
        </span>
      );
    }

    if (typeof displayValue === "string") {
      const isLongText = displayValue.length > 40;
      const truncated = isLongText
        ? displayValue.slice(0, 40) + "..."
        : displayValue;

      return (
        <span className="font-mono text-sm text-gray-700 block">
          {truncated}
        </span>
      );
    }

    if (typeof displayValue === "number") {
      return (
        <span className="font-mono text-sm text-gray-700">{displayValue}</span>
      );
    }

    if (Array.isArray(displayValue)) {
      return (
        <span className="text-sm text-gray-600">Array[{displayValue.length}]</span>
      );
    }

    if (displayValue !== null && typeof displayValue === "object") {
      const keys = Object.keys(displayValue);
      return (
        <span className="text-sm text-gray-600">
          Object[{keys.length}] {keys.length > 0 && `{${keys[0]}...}`}
        </span>
      );
    }

    return (
      <span className="font-mono text-sm text-gray-700">{String(displayValue)}</span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Google Sheets-style Table */}
      <div className="border border-gray-100 rounded-sm bg-white shadow-sm overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: "600px" }}>
          <Table
            className="table-fixed border-collapse"
            style={{
              minWidth: `${60 + fields.length * 200}px`,
            }}
          >
            <TableHeader className="bg-gray-50/30 sticky top-0 z-20">
              <TableRow className="hover:bg-transparent border-0">
                {/* Row Number Header */}
                <TableHead className="w-[60px] text-center sticky left-0 bg-white z-40 border-r border-gray-100/60 h-10 px-2">
                  <Hash className="h-3 w-3 mx-auto text-gray-400" />
                </TableHead>

                {/* Field Headers */}
                {fields.map((field) => (
                  <TableHead
                    key={field}
                    className="w-[200px] font-medium text-gray-700 text-sm border-r border-gray-100/60 px-3 py-2 align-bottom"
                  >
                    <div className="flex flex-col">
                      <span className="truncate">{field}</span>
                      <span className="text-[10px] text-gray-400 font-normal tracking-wide">
                        {fieldTypes.get(field) ?? "Unknown"}
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {documents.map((doc, i) => (
                <TableRow
                  key={i}
                  className="bg-white hover:bg-blue-50 border-0 group duration-100 cursor-pointer z-20"
                  onClick={() => handleOpenJsonSidebar(doc)}
                >
                  {/* Row Number */}
                  <TableCell className="text-center sticky left-0 z-30 border-r border-b border-gray-100/60 h-12 px-2 bg-gray-50 group-hover:bg-blue-50">
                    <span className="text-xs text-gray-500 font-medium">
                      {i + 1}
                    </span>
                  </TableCell>

                  {/* Field Values */}
                  {fields.map((field) => (
                    <TableCell
                      key={field}
                      className="w-[200px] border-r border-b border-gray-100/60 h-12 px-3"
                    >
                      <div className="truncate">
                        {renderCellValue(doc[field])}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

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

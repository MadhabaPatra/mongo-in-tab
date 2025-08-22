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
import { Copy, Edit, FileText, Hash, X } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { copyToClipboard, getFieldType } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import EditDocument from "@/components/documents/edit-documents";

interface DocumentsTableViewProps {
  connectionId: string;
  database: string;
  collectionName: string;
  fields: string[];
  documents: IDocument[];
}

export function DocumentsTableView({
  connectionId,
  database,
  collectionName,
  fields,
  documents,
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

  const displayAllFieldsExceptID = fields.filter((field) => field !== "_id");

  const renderCellValue = (value: any, field: string) => {
    const fieldType = getFieldType(value);

    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic text-sm">null</span>;
    }

    if (typeof value === "boolean") {
      return (
        <span
          className={`font-medium text-sm ${value ? "text-green-600" : "text-red-600"}`}
        >
          {value.toString()}
        </span>
      );
    }

    if (typeof value === "string") {
      let displayValue = value;

      // Clean up MongoDB-specific formats
      switch (fieldType) {
        case "objectid":
          displayValue = value.replace("ObjectId('", "").replace("')", "");
          break;
        case "int32":
          displayValue = value.replace("NumberInt(", "").replace(")", "");
          break;
        case "int64":
          displayValue = value.replace("NumberLong(", "").replace(")", "");
          break;
        case "double":
          displayValue = value.replace("NumberDouble(", "").replace(")", "");
          break;
        case "decimal128":
          displayValue = value.replace("NumberDecimal('", "").replace("')", "");
          break;
        case "date":
          displayValue = value.replace("ISODate('", "").replace("')", "");
          break;
        case "timestamp":
          displayValue = value.replace("Timestamp(", "").replace(")", "");
          break;
      }

      const isLongText = displayValue.length > 40;
      const truncatedValue = isLongText
        ? displayValue.slice(0, 40) + "..."
        : displayValue;

      return (
        <span className="font-mono text-sm text-gray-700 block">
          {truncatedValue}
        </span>
      );
    }

    if (Array.isArray(value)) {
      return (
        <span className="text-sm text-gray-600">
          Array[{value.length}] {value.length > 0 && `(${typeof value[0]}...)`}
        </span>
      );
    }

    if (typeof value === "object") {
      const keys = Object.keys(value);
      return (
        <span className="text-sm text-gray-600">
          Object[{keys.length}] {keys.length > 0 && `{${keys[0]}...}`}
        </span>
      );
    }

    return (
      <span className="font-mono text-sm text-gray-700">{String(value)}</span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Info - Simplified */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-3">
          <FileText className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500">
              {documents.length} rows • {fields.length} columns
            </p>
          </div>
        </div>
      </div>

      {/* Google Sheets-style Table */}
      <div className="border border-gray-100 rounded-sm bg-white shadow-sm overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: "600px" }}>
          <Table
            className="table-fixed border-collapse"
            style={{
              minWidth: `${280 + displayAllFieldsExceptID.length * 200}px`,
            }}
          >
            <TableHeader className="bg-gray-50/30 sticky top-0 z-20">
              <TableRow className="hover:bg-transparent border-0">
                {/* Row Number Header */}
                <TableHead className="w-[60px] text-center sticky left-0 bg-white z-40 border-r border-gray-100/60 h-10 px-2">
                  <Hash className="h-3 w-3 mx-auto text-gray-400" />
                </TableHead>

                {/* Document ID Header */}
                <TableHead className="w-[220px] font-medium text-gray-700 text-sm sticky left-[60px] bg-white z-40 border-r border-gray-100/60 h-10 px-3">
                  Document ID
                </TableHead>

                {/* Field Headers */}
                {displayAllFieldsExceptID.map((field, index) => (
                  <TableHead
                    key={field}
                    className="w-[200px] font-medium text-gray-700 text-sm border-r border-gray-100/60 h-10 px-3"
                  >
                    <div className="flex items-center">
                      <span className="truncate">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
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
                  <TableCell className="text-center sticky left-0  z-30 border-r  border-b border-gray-100/60 h-12 px-2 bg-gray-50 group-hover:bg-blue-50">
                    <span className="text-xs text-gray-500 font-medium">
                      {i + 1}
                    </span>
                  </TableCell>

                  {/* Document ID */}
                  <TableCell className="sticky left-[60px] z-30 border-r border-b border-gray-100/60 h-12 px-3 bg-gray-50 group-hover:bg-blue-50">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <code
                            className="text-xs font-mono px-2 py-1 rounded text-gray-600 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(doc._id);
                              toast.success("Document ID copied");
                            }}
                          >
                            {doc._id.slice(0, 8)}...{doc._id.slice(-4)}
                          </code>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click to copy</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  {/* Field Values */}
                  {displayAllFieldsExceptID.map((field) => (
                    <TableCell
                      key={field}
                      className="w-[200px] border-r border-b border-gray-100/60 h-12 px-3"
                    >
                      <div className="truncate">
                        {renderCellValue(doc[field], field)}
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
                  ID: {sidebarDocument?._id}
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
            toast.success("Document updated successfully");
          }}
        />
      )}
    </div>
  );
}

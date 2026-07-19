"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Copy, FileJson } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { JsonTree } from "./json-tree";

interface DocumentsJsonViewProps {
  documents: IDocument[];
}

export function DocumentsJsonView({ documents }: DocumentsJsonViewProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const allJson = useMemo(() => {
    return documents.map((d) => JSON.stringify(d, null, 2)).join("\n\n");
  }, [documents]);

  const handleCopyDoc = (json: string, index: number) => {
    copyToClipboard(json);
    setCopiedIndex(index);
    toast.success("Document copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FileJson className="h-4 w-4" />
          <span>
            {documents.length} document{documents.length !== 1 ? "s" : ""} in
            EJSON format
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            copyToClipboard(allJson);
            toast.success("All documents copied to clipboard");
          }}
        >
          <Copy className="h-3.5 w-3.5 mr-1.5" />
          Copy All
        </Button>
      </div>

      {/* Document cards */}
      <div className="space-y-2">
        {documents.map((doc, index) => {
          const json = JSON.stringify(doc, null, 2);
          return (
            <div
              key={doc._id?.toString() ?? index}
              className="border border-gray-200 rounded-lg bg-white overflow-hidden"
            >
              {/* Doc header */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                <span className="text-[10px] font-mono text-gray-400">
                  #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyDoc(json, index)}
                  className="text-[10px] text-gray-500 hover:text-gray-700 px-1.5 py-0.5 rounded hover:bg-gray-100 transition-colors"
                >
                  {copiedIndex === index ? "Copied!" : "Copy"}
                </button>
              </div>

              {/* Interactive JSON tree */}
              <div className="p-3 overflow-auto max-h-[60vh]">
                <JsonTree data={doc} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

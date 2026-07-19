"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, FileJson, ChevronDown, ChevronUp } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentsJsonViewProps {
  documents: IDocument[];
}

function formatEJSON(doc: IDocument): string {
  try {
    return JSON.stringify(doc, null, 2);
  } catch {
    return "{}";
  }
}

export function DocumentsJsonView({ documents }: DocumentsJsonViewProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const allJson = useMemo(() => {
    return documents.map((d) => formatEJSON(d)).join("\n\n");
  }, [documents]);

  const toggleExpand = (index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

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

      {/* Document list — each as its own EJSON block */}
      <div className="space-y-2">
        {documents.map((doc, index) => {
          const json = formatEJSON(doc);
          const isExpanded = expanded.has(index);
          const preview = json.slice(0, 200);
          const showToggle = json.length > 200;

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
                <div className="flex items-center gap-1">
                  {showToggle && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(index)}
                      className="flex items-center gap-0.5 text-[10px] text-blue-600 hover:text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          Collapse
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Expand
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCopyDoc(json, index)}
                    className="text-[10px] text-gray-500 hover:text-gray-700 px-1.5 py-0.5 rounded hover:bg-gray-100 transition-colors"
                  >
                    {copiedIndex === index ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* JSON body */}
              <pre className="text-xs font-mono p-3 overflow-auto max-h-[50vh] whitespace-pre-wrap text-gray-800 leading-relaxed">
                {isExpanded || !showToggle ? json : preview + "..."}
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
}

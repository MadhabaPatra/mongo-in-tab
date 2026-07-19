"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, FileJson } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentsJsonViewProps {
  documents: IDocument[];
}

export function DocumentsJsonView({ documents }: DocumentsJsonViewProps) {
  const [showAll, setShowAll] = useState(false);

  const { jsonString, truncated, error } = useMemo(() => {
    try {
      const MAX_CHARS = 500_000;
      const raw = JSON.stringify(documents, null, 2);
      if (raw.length > MAX_CHARS) {
        return {
          jsonString: raw.slice(0, MAX_CHARS) + "\n\n... truncated",
          truncated: true,
          error: null,
        };
      }
      return { jsonString: raw, truncated: false, error: null };
    } catch (e) {
      return {
        jsonString: "",
        truncated: false,
        error: e instanceof Error ? e.message : "Failed to stringify documents",
      };
    }
  }, [documents]);

  const displayed = showAll ? jsonString : jsonString;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FileJson className="h-4 w-4" />
          <span>
            {documents.length} document{documents.length !== 1 ? "s" : ""} in JSON
            format
            {truncated && !showAll && (
              <span className="text-amber-600 ml-2">
                (large result — truncated for performance)
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {truncated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll((s) => !s)}
              className="h-7 text-xs"
            >
              {showAll ? "Collapse" : "Show All"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              copyToClipboard(jsonString);
              toast.success("JSON copied to clipboard");
            }}
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Copy All
          </Button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
        {error ? (
          <div className="p-4 text-xs text-red-600">
            <p className="font-medium">Error rendering JSON:</p>
            <p>{error}</p>
          </div>
        ) : (
          <pre className="text-xs font-mono p-4 overflow-auto max-h-[70vh] whitespace-pre-wrap text-gray-800 leading-relaxed">
            {displayed}
          </pre>
        )}
      </div>
    </div>
  );
}

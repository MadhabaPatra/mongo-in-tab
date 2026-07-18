"use client";

import { Button } from "@/components/ui/button";
import { Copy, FileJson } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentsJsonViewProps {
  documents: IDocument[];
}

export function DocumentsJsonView({ documents }: DocumentsJsonViewProps) {
  const jsonString = JSON.stringify(documents, null, 2);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FileJson className="h-4 w-4" />
          <span>{documents.length} documents in EJSON format</span>
        </div>
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

      <div className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
        <pre className="text-xs font-mono p-4 overflow-auto max-h-[70vh] whitespace-pre-wrap text-gray-800 leading-relaxed">
          {jsonString}
        </pre>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function FilterDocuments({
  fields,
  filterApplied,
}: {
  fields: string[];
  filterApplied: () => void;
}) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [query, setQuery] = useState("{}");

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  // Handle query change
  const handleQueryChange = (value: string) => {
    setQuery(value);

    // Get current word being typed
    const beforeCursor = value.slice(0, cursorPosition);
    const afterCursor = value.slice(cursorPosition);
    const currentWord = beforeCursor.split(/[\s"':,{}[\]()]/).pop() || "";

    if (currentWord.length > 0) {
      const suggestions = fields.filter((field) =>
        field.toLowerCase().includes(currentWord.toLowerCase()),
      );
      setFilteredSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertSuggestion = (field: string) => {
    const beforeCursor = query.slice(0, cursorPosition);
    const afterCursor = query.slice(cursorPosition);
    const words = beforeCursor.split(/[\s"':,{}[\]()]/);
    const currentWord = words.pop() || "";
    const beforeWord = words.join(" ");

    const newQuery =
      beforeWord + (beforeWord ? " " : "") + `"${field}"` + afterCursor;
    setQuery(newQuery);
    setShowSuggestions(false);
  };

  const applyFilter = () => {
    setIsFilterModalOpen(false);
    filterApplied();
  };

  const clearFilter = () => {
    setQuery("{}");
    setIsFilterModalOpen(false);
    filterApplied();
  };

  return (
    <div className="flex items-center gap-3">
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer bg-transparent"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter Documents
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="font-mono">
              (Still in development)
              {/*MongoDB Query Filter */}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Query:</label>
              <div className="relative">
                <Textarea
                  placeholder='{"name": {"$regex": "John", "$options": "i"}}'
                  value={query}
                  onChange={(e) => {
                    setCursorPosition(e.target.selectionStart || 0);
                    handleQueryChange(e.target.value);
                  }}
                  // onSelect={(e) =>
                  //   setCursorPosition(e.target.selectionStart || 0)
                  // }
                  className="font-mono text-sm min-h-[120px] resize-none"
                  rows={5}
                />
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                    {filteredSuggestions.map((field) => (
                      <button
                        key={field}
                        onClick={() => insertSuggestion(field)}
                        className="w-full text-left px-3 py-2 hover:bg-muted text-sm font-mono flex items-center justify-between"
                      >
                        <span>{field}</span>
                        {/*<Badge variant="secondary" className="text-xs">*/}
                        {/*  {getFieldType(sampleDocuments[0][field])}*/}
                        {/*</Badge>*/}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  Enter MongoDB query syntax. Start typing field names to see
                  suggestions.
                </p>
                <p className="font-mono">
                  Examples: {`{"age": {"$gt": 25}}`}, {`{"isActive": true}`},{" "}
                  {`{"name": {"$regex": "John", "$options": "i"}}`}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Available Fields:</label>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-2 bg-muted/30 rounded">
                {fields.map((field) => (
                  <button
                    key={field}
                    onClick={() => insertSuggestion(field)}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-background border rounded text-xs font-mono hover:bg-muted cursor-pointer"
                  >
                    {field}
                    {/*<Badge variant="outline" className="text-xs">*/}
                    {/*  /!*{getFieldType(sampleDocuments[0][field])}*!/*/}
                    {/*</Badge>*/}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={clearFilter}
                className="cursor-pointer bg-transparent"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filter
              </Button>

              <Button onClick={() => applyFilter} className="cursor-pointer">
                Apply Filter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

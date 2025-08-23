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
import { Filter, X, Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface FilterDocumentsProps {
  fields: string[];
  onFilterApplied: (query: string) => void;
  currentFilter?: string;
}

export function FilterDocuments({
  fields,
  onFilterApplied,
  currentFilter = "{}",
}: FilterDocumentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(currentFilter);
  const [searchField, setSearchField] = useState("");
  const [isValidQuery, setIsValidQuery] = useState(true);

  // Filter available fields based on search
  const filteredFields = fields.filter((field) =>
    field.toLowerCase().includes(searchField.toLowerCase()),
  );

  // Validate JSON query
  const validateQuery = (queryString: string) => {
    try {
      JSON.parse(queryString);
      setIsValidQuery(true);
    } catch {
      setIsValidQuery(false);
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    validateQuery(value);
  };

  const insertField = (field: string) => {
    const fieldTemplate = `"${field}": `;

    // Simple insertion at the end before closing brace
    if (query === "{}") {
      setQuery(`{"${field}": ""}`);
    } else {
      const insertPosition = query.lastIndexOf("}");
      const beforeBrace = query.slice(0, insertPosition);
      const needsComma =
        beforeBrace.trim().length > 1 && !beforeBrace.trim().endsWith(",");
      const newQuery =
        beforeBrace +
        (needsComma ? ", " : "") +
        fieldTemplate +
        '""' +
        query.slice(insertPosition);
      setQuery(newQuery);
    }
    setSearchField("");
  };

  const applyFilter = () => {
    if (isValidQuery) {
      onFilterApplied(query);
      setIsOpen(false);
    }
  };

  const clearFilter = () => {
    setQuery("{}");
    onFilterApplied("{}");
    setIsOpen(false);
  };

  const resetToDefault = () => {
    setQuery("{}");
    setIsValidQuery(true);
  };

  const hasActiveFilter = currentFilter !== "{}";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={hasActiveFilter ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[95vh] flex flex-col"
        style={{ width: "90vw", maxWidth: "1400px" }}
      >
        <DialogHeader>
          <DialogTitle>Filter Documents</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 gap-8 min-h-0">
          {/* Left Panel - Query Editor */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">MongoDB Query</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetToDefault}
                  className="text-xs"
                >
                  Reset
                </Button>
              </div>

              <Textarea
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder='{"field": "value"}'
                className={`font-mono text-sm min-h-[280px] resize-none ${
                  !isValidQuery ? "border-red-500 focus:border-red-500" : ""
                }`}
              />

              {!isValidQuery && (
                <p className="text-red-500 text-xs">Invalid JSON syntax</p>
              )}
            </div>

            {/* Query Examples */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Examples</label>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {[
                  {
                    label: "Text contains",
                    value: '{"name": {"$regex": "John", "$options": "i"}}',
                  },
                  { label: "Greater than", value: '{"age": {"$gt": 25}}' },
                  { label: "Exact match", value: '{"status": "active"}' },
                  { label: "Boolean", value: '{"isPublished": true}' },
                ].map((example) => (
                  <button
                    key={example.label}
                    onClick={() => setQuery(example.value)}
                    className="text-left p-2 bg-muted/50 rounded hover:bg-muted transition-colors"
                  >
                    <div className="font-medium">{example.label}</div>
                    <code className="text-muted-foreground">
                      {example.value}
                    </code>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Available Fields */}
          <div className="w-96 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Available Fields</label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search fields..."
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="border rounded-lg max-h-[400px] overflow-y-auto">
              {filteredFields.length > 0 ? (
                <div className="p-2 space-y-1">
                  {filteredFields.map((field) => (
                    <button
                      key={field}
                      onClick={() => insertField(field)}
                      className="w-full text-left px-3 py-2 text-sm font-mono bg-background hover:bg-muted rounded border transition-colors"
                    >
                      {field}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No fields found
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1 px-3 bg-muted/30 rounded">
              <p>
                <strong>Tips:</strong>
              </p>
              <ul className="space-y-1 ml-2">
                <li>• Click fields to insert them</li>
                <li>• Use MongoDB query syntax</li>
                <li>• $regex for text search</li>
                <li>• $gt, $lt for numbers</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={clearFilter} className="gap-2">
            <X className="h-4 w-4" />
            Clear Filter
          </Button>

          <Button
            onClick={applyFilter}
            disabled={!isValidQuery}
            className="gap-2"
          >
            Apply Filter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

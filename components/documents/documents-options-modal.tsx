"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { validateQueryString } from "@/lib/utils";
import { Settings, RotateCcw } from "lucide-react";

interface DocumentsOptionsModalProps {
  options: DocumentQueryOptions;
  onOptionsChange: (options: DocumentQueryOptions) => void;
}

export function DocumentsOptionsModal({
  options,
  onOptionsChange,
}: DocumentsOptionsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localOptions, setLocalOptions] = useState<DocumentQueryOptions>(options);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalOptions(options);
  }, [options, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (localOptions.project && localOptions.project.trim() && localOptions.project !== "{}") {
      const err = validateQueryString(localOptions.project);
      if (err) newErrors.project = err;
    }

    if (localOptions.sort && localOptions.sort.trim() && localOptions.sort !== "{}") {
      const err = validateQueryString(localOptions.sort);
      if (err) newErrors.sort = err;
    }

    if (localOptions.skip !== undefined && localOptions.skip < 0) {
      newErrors.skip = "Skip must be >= 0";
    }

    if (localOptions.maxTimeMS !== undefined && localOptions.maxTimeMS < 1) {
      newErrors.maxTimeMS = "Max time must be >= 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApply = () => {
    if (validate()) {
      onOptionsChange(localOptions);
      setIsOpen(false);
    }
  };

  const handleReset = () => {
    const reset: DocumentQueryOptions = {};
    setLocalOptions(reset);
    setErrors({});
    onOptionsChange(reset);
  };

  const hasOptions =
    options.project ||
    options.sort ||
    options.skip !== undefined ||
    options.maxTimeMS !== undefined;

  return (
    <>
      <Button
        variant={hasOptions ? "default" : "outline"}
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5"
      >
        <Settings className="h-3.5 w-3.5" />
        Options
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Query Options
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-7 gap-1 text-xs"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Project */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Project (fields to include/exclude)</label>
              <Textarea
                value={localOptions.project || "{}"}
                onChange={(e) =>
                  setLocalOptions((prev) => ({ ...prev, project: e.target.value }))
                }
                placeholder='{"name": 1, "email": 1}'
                className={`font-mono text-sm min-h-[60px] resize-none ${
                  errors.project ? "border-red-500 focus:border-red-500" : ""
                }`}
              />
              {errors.project && (
                <p className="text-red-500 text-xs">{errors.project}</p>
              )}
            </div>

            {/* Sort */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Sort</label>
              <Textarea
                value={localOptions.sort || "{}"}
                onChange={(e) =>
                  setLocalOptions((prev) => ({ ...prev, sort: e.target.value }))
                }
                placeholder='{"createdAt": -1}'
                className={`font-mono text-sm min-h-[60px] resize-none ${
                  errors.sort ? "border-red-500 focus:border-red-500" : ""
                }`}
              />
              {errors.sort && (
                <p className="text-red-500 text-xs">{errors.sort}</p>
              )}
            </div>

            {/* Skip & Max Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Skip</label>
                <Input
                  type="number"
                  min={0}
                  value={localOptions.skip ?? ""}
                  onChange={(e) =>
                    setLocalOptions((prev) => ({
                      ...prev,
                      skip: e.target.value ? Number.parseInt(e.target.value) : undefined,
                    }))
                  }
                  placeholder="0"
                  className={errors.skip ? "border-red-500" : ""}
                />
                {errors.skip && (
                  <p className="text-red-500 text-xs">{errors.skip}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Max Time (ms)</label>
                <Input
                  type="number"
                  min={1}
                  value={localOptions.maxTimeMS ?? ""}
                  onChange={(e) =>
                    setLocalOptions((prev) => ({
                      ...prev,
                      maxTimeMS: e.target.value
                        ? Number.parseInt(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder="5000"
                  className={errors.maxTimeMS ? "border-red-500" : ""}
                />
                {errors.maxTimeMS && (
                  <p className="text-red-500 text-xs">{errors.maxTimeMS}</p>
                )}
              </div>
            </div>

            {/* Apply */}
            <div className="flex justify-end pt-2">
              <Button onClick={handleApply} size="sm">
                Apply Options
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

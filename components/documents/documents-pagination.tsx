import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export function DocumentsPagination({
  pagination,
  onPaginationChange,
}: {
  pagination: IDocumentPagination;
  onPaginationChange: (limit: number, pageNo: number) => void;
}) {
  const [currentPage, setCurrentPage] = useState(pagination.currentPage || 1);
  const [limit, setLimit] = useState(25);

  useEffect(() => {
    setCurrentPage(pagination.currentPage || 1);
  }, [pagination.currentPage]);

  const goToPage = (page: number) => {
    const newPage = Math.max(1, Math.min(pagination.totalPages, page));
    setCurrentPage(newPage);
    onPaginationChange(limit, newPage);
  };

  const handleLimitChange = (newLimit: string) => {
    const limitNum = Number.parseInt(newLimit);
    setLimit(limitNum);
    setCurrentPage(1);
    onPaginationChange(limitNum, 1);
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Document info */}
      <Badge variant="outline" className="text-xs text-gray-600">
        Showing{" "}
        <span className="font-medium text-gray-900">
          {pagination.start}-{pagination.end}
        </span>{" "}
        of{" "}
        <span className="font-medium text-gray-900">
          {pagination.totalDocuments.toLocaleString()}
        </span>
        {" documents"}
      </Badge>

      {/* Navigation */}
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>

        <div className="flex items-center space-x-1">
          {(() => {
            // Show max 3 page numbers for header
            const pages = [];
            const totalPages = pagination.totalPages;

            if (totalPages <= 3) {
              for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
              }
            } else {
              if (currentPage === 1) {
                pages.push(1, 2, 3);
              } else if (currentPage === totalPages) {
                pages.push(totalPages - 2, totalPages - 1, totalPages);
              } else {
                pages.push(currentPage - 1, currentPage, currentPage + 1);
              }
            }

            return pages.map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                onClick={() => goToPage(page)}
                className={`h-7 w-7 p-0 text-xs ${
                  currentPage === page
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </Button>
            ));
          })()}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === pagination.totalPages}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>

      {/* Items per page */}
      <Select value={limit.toString()} onValueChange={handleLimitChange}>
        <SelectTrigger className="h-7 text-xs border-gray-300">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5 per page</SelectItem>
          <SelectItem value="10">10 per page</SelectItem>
          <SelectItem value="25">25 per page</SelectItem>
          <SelectItem value="50">50 per page</SelectItem>
          <SelectItem value="100">100 per page</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

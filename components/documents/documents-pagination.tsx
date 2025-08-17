import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function DocumentsPagination({
  pagination,
  onPaginationChange,
}: {
  pagination: IDocumentPagination;
  onPaginationChange: (limit: number, pageNo: number) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(pagination.totalPages, page)));
    onPaginationChange(limit, page);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 border-t bg-muted/20 border-b-0">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Showing {pagination.start} to {pagination.end} of{" "}
          {pagination.totalDocuments} documents
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* First page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          className="cursor-pointer"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {(() => {
            const pages = [];
            const showPages = 5;
            let startPage = Math.max(
              1,
              currentPage - Math.floor(showPages / 2),
            );
            const endPage = Math.min(
              pagination.totalPages,
              startPage + showPages - 1,
            );

            if (endPage - startPage + 1 < showPages) {
              startPage = Math.max(1, endPage - showPages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <Button
                  key={i}
                  variant={currentPage === i ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(i)}
                  className="w-8 h-8 p-0 cursor-pointer"
                >
                  {i}
                </Button>,
              );
            }
            return pages;
          })()}
        </div>

        {/* Next page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === pagination.totalPages}
          className="cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(pagination.totalPages)}
          disabled={currentPage === pagination.totalPages}
          className="cursor-pointer"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={limit.toString()}
          onValueChange={(value) => {
            setLimit(Number.parseInt(value));
            setCurrentPage(1);
            onPaginationChange(Number.parseInt(value), 1);
          }}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">per page</span>
      </div>
    </div>
  );
}

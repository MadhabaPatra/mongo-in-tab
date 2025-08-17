"use client";
import { Card, CardContent } from "@/components/ui/card";
import { FileX } from "lucide-react";

export function DocumentsEmptyState({
  searchTerm,
}: {
  searchTerm: string | undefined | null;
}) {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <FileX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No documents found</h3>
        <p className="text-muted-foreground">
          {searchTerm?.trim()
            ? "No documents match your query. Try adjusting the query syntax."
            : "This collection appears to be empty."}
        </p>
      </CardContent>
    </Card>
  );
}

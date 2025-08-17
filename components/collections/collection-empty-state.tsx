"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Database, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function CollectionEmptyState({
  searchTerm,
  clearSearch,
}: {
  searchTerm: string | undefined | null;
  clearSearch: () => void;
}) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Layers className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>No collections found</CardTitle>
          <CardDescription>
            {searchTerm
              ? "Try adjusting your search query."
              : "This database appears to be empty."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searchTerm ? (
            <Button
              variant="outline"
              onClick={() => clearSearch()}
              className="w-full"
            >
              Clear Search
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                router.back();
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Try Different Database
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

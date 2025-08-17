"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DatabaseEmptyState({
  searchTerm,
  clearSearch,
}: {
  searchTerm: string | undefined | null;
  clearSearch: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Database className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>No Databases Found</CardTitle>
          <CardDescription>
            {searchTerm
              ? "No databases match your current search criteria."
              : "This MongoDB instance doesn't contain any databases yet."}
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
            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/app">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Try Different Connection
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

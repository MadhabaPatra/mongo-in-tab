"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

export function DocumentErrorState({
  errorMessage,
  onClickRefresh = () => {},
}: {
  errorMessage: string;
  onClickRefresh?: () => void;
}) {
  const router = useRouter();

  const onClickGoBack = () => {
    router.back();
  };

  const isTimeoutError = errorMessage
    .toLowerCase()
    .includes("exceeded time limit");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div
                className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  isTimeoutError ? "bg-amber-100" : "bg-red-100"
                }`}
              >
                {isTimeoutError ? (
                  <Clock className="h-6 w-6 text-amber-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <CardTitle
                className={isTimeoutError ? "text-amber-900" : "text-red-900"}
              >
                {isTimeoutError ? "Query Timed Out" : "Documents Load Failed"}
              </CardTitle>
              <CardDescription>
                {isTimeoutError
                  ? "Operation exceeded time limit. Please try increasing the maxTimeMS for the query in the expanded filter options."
                  : errorMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => {
                  onClickRefresh();
                }}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  onClickGoBack();
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Collections
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

export function CollectionErrorState({
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-900">
                Collection Load Failed
              </CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
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
                Back to Databases
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

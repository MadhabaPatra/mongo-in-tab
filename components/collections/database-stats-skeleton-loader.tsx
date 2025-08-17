"use client";
import { Card, CardContent } from "@/components/ui/card";

export function DatabaseStatsSkeletonLoader() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card
          key={i}
          className="bg-gradient-to-br from-muted/20 to-muted/10 border-muted/40"
        >
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-muted/20 animate-pulse">
                <div className="h-5 w-5 bg-muted rounded" />
              </div>
              <div className="space-y-1">
                <div className="h-5 w-12 bg-muted rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

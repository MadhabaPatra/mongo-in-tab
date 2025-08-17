"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Database, FileText, HardDrive, Layers, Users } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

export function CollectionCard({ collection }: { collection: ICollection }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const connectionId = searchParams.get("connectionId");
  const database = searchParams.get("database");

  const onClick = () => {
    router.push(
      `/app/documents?connectionId=${connectionId}&database=${database}&collectionName=${collection.name}`,
    );
  };

  return (
    <Card
      onClick={onClick}
      className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h3 className="font-mono font-semibold text-lg group-hover:text-primary transition-colors">
              {collection.name}
            </h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            {/*{isLoading ? (*/}
            {/*  <div className="h-4 w-16 bg-muted rounded animate-pulse" />*/}
            {/*) : (*/}
            {/*  <>*/}
            {/*    <span className="font-medium">*/}
            {/*      {collection?.documentCount.toLocaleString()}*/}
            {/*    </span>*/}
            {/*    <span className="text-muted-foreground">docs</span>*/}
            {/*  </>*/}
            {/*)}*/}
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            {/*{isLoading ? (*/}
            {/*  <div className="h-4 w-12 bg-muted rounded animate-pulse" />*/}
            {/*) : (*/}
            {/*  <span className="font-medium">*/}
            {/*    {" "}*/}
            {/*    {collection.totalSize ? formatBytes(collection.totalSize) : ""}*/}
            {/*  </span>*/}
            {/*)}*/}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

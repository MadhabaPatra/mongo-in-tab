"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Database, FileText, Users } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

export function DatabaseCard({ database }: { database: IDatabase }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const connectionId = searchParams.get("connectionId");

  const onClick = () => {
    router.push(
      `/app/collections?connectionId=${connectionId}&database=${database.name}`,
    );
  };

  return (
    <Card
      className="hover:bg-muted/30 hover:border-primary/20 hover:shadow-sm transition-all duration-200 cursor-pointer border-muted/40 group relative"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
        <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium shadow-lg">
          Click to browse collections
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Database className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-mono text-base font-medium text-foreground group-hover:text-primary transition-colors">
              {database.name}
            </h3>
            <div className="text-sm text-muted-foreground mt-0.5">
              {database.sizeOnDisk ? formatBytes(database.sizeOnDisk) : ""}
            </div>
          </div>
        </div>

        {/*<div className="flex items-center justify-between gap-6 py-2">*/}
        {/*  <div className="flex items-center gap-2 text-muted-foreground">*/}
        {/*    <FileText className="h-4 w-4 text-blue-500" />*/}
        {/*    <span className="text-sm">*/}
        {/*      Collections: {db.totalCollections}*/}
        {/*    </span>*/}
        {/*  </div>*/}
        {/*  <div className="flex items-center gap-2 text-muted-foreground">*/}
        {/*    <Users className="h-4 w-4 text-green-500" />*/}
        {/*    <span className="text-sm">*/}
        {/*      Documents: {db.totalDocuments}*/}
        {/*    </span>*/}
        {/*  </div>*/}
        {/*</div>*/}

        {/*<div className="pt-3 border-t border-muted/20">*/}
        {/*  <div className="text-sm text-muted-foreground">*/}
        {/*    Last updated {formatDate(db.lastModified)}*/}
        {/*  </div>*/}
        {/*</div>*/}
      </CardContent>
    </Card>
  );
}

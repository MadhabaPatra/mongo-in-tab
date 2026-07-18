"use client";
import { Card } from "@/components/ui/card";
import { Database, ChevronRight } from "lucide-react";
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
      onClick={onClick}
      className="
        p-3.5
        cursor-pointer
        border border-gray-200
        bg-white
        hover:border-primary/40
        hover:shadow-md
        hover:bg-primary/[0.02]
        active:scale-[0.99]
        transition-all duration-150
        group
      "
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Icon */}
        <div className="shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Database className="h-4 w-4 text-primary" />
        </div>

        {/* Name + Size */}
        <div className="flex-1 min-w-0">
          <h3 className="font-mono font-medium text-sm text-gray-900 group-hover:text-primary transition-colors break-all leading-snug">
            {database.name}
          </h3>
          {database.sizeOnDisk ? (
            <p className="text-xs text-gray-400 mt-0.5">
              {formatBytes(database.sizeOnDisk)}
            </p>
          ) : null}
        </div>

        {/* Arrow indicator */}
        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
      </div>
    </Card>
  );
}

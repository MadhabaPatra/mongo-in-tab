"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Database, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { formatTimestamp } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function ConnectionCard({
  connection,
  clearConnectionById,
}: {
  connection: IConnection;
  clearConnectionById: (id: string) => void;
}) {
  const router = useRouter();

  const onClickConnect = (connection: IConnection) => {
    router.push("/app/databases?connectionId=" + connection.id);
  };

  const onClickRemove = (connection: IConnection) => {
    clearConnectionById(connection.id);
  };

  return (
    <Card className="hover:shadow-sm transition-all duration-200 border border-slate-200">
      <CardContent className="p-2 px-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <Database className="h-6 text-primary flex-shrink-0 w-6" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono truncate flex-1 text-foreground/90 max-w-md">
                  {connection.url}
                </code>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-shrink-0 gap-3 mx-0 mr-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
              <Clock className="h-3 w-3" />
              <span>
                {connection?.lastUsed
                  ? formatTimestamp(connection.lastUsed)
                  : "Long time ago"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onClickConnect(connection)}
              className="h-6 px-2 text-xs hover:bg-transparent hover:text-primary cursor-pointer"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Connect
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onClickRemove(connection)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

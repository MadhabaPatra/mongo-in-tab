"use client";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <Card className="hover:border-gray-300 transition-colors border-gray-200 group">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3">
          {/* Connection info */}
          <div className="flex-1 min-w-0">
            <code className="text-sm text-gray-900 font-mono truncate block">
              {connection.url}
            </code>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onClickConnect(connection)}
              size="sm"
              className="h-7 px-3 text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Connect
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onClickRemove(connection)}
              className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

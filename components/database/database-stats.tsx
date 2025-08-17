"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Database, FileText, Users } from "lucide-react";

interface IDatabaseStats {
  totalDatabases: number;
  totalCollections: number;
  totalDocuments: number;
}

export function DatabaseStats({ data }: { data: IDatabaseStats }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-blue-900">
                  {data.totalDatabases}
                </div>
                <div className="text-xs text-blue-700 font-medium">
                  Databases
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-green-900">
                  {data.totalCollections}
                </div>
                <div className="text-xs text-green-700 font-medium">
                  Collections
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-500/10">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-purple-900">
                  {data.totalDocuments}
                </div>
                <div className="text-xs text-purple-700 font-medium">
                  Documents
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";

export const TableViewPlaceholder = () => (
  <div className="h-full flex items-center justify-center p-8">
    <Card>
      <CardContent className="p-8 text-center">
        <div className="text-4xl mb-4">🚧</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Table Mode</h3>
        <p className="text-gray-600">
          This feature is currently in development.
        </p>
      </CardContent>
    </Card>
  </div>
);

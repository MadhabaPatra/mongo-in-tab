import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-4 sm:p-6 space-y-3 bg-white"
            >
              <Skeleton className="h-5 bg-gray-200 w-3/4" />
              <Skeleton className="h-3 bg-gray-200 w-1/2" />
              <Skeleton className="h-3 bg-gray-200 w-full" />
              <Skeleton className="h-3 bg-gray-200 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

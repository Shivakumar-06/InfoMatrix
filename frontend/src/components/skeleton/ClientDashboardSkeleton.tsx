import { Card, CardContent, CardHeader } from "../ui/card";

const SkeletonBox = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md ${className}`} />
);

const ClientDashboardSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-4">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <SkeletonBox className="h-6 w-40" />
        <SkeletonBox className="h-4 w-72" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center gap-3">
              <SkeletonBox className="h-12 w-12 rounded-lg" />
              <div className="flex flex-col gap-2">
                <SkeletonBox className="h-3 w-20" />
                <SkeletonBox className="h-4 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Reports Table Skeleton */}
      <Card>
        <CardHeader>
          <SkeletonBox className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-4 gap-4 items-center border-b pb-2"
              >
                <SkeletonBox className="h-4 w-20" />
                <SkeletonBox className="h-4 w-32" />
                <SkeletonBox className="h-4 w-16" />
                <SkeletonBox className="h-8 w-14 rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation Skeleton */}
      <Card>
        <CardHeader>
          <SkeletonBox className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <SkeletonBox className="h-5 w-5 rounded-md" />
                  <SkeletonBox className="h-4 w-24" />
                </div>
                <SkeletonBox className="h-8 w-12 rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <SkeletonBox className="h-5 w-48" />
            </CardHeader>
            <CardContent>
              <SkeletonBox className="h-64 w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClientDashboardSkeleton;

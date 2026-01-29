import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function GameCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2">
        <Skeleton className="h-4 w-3/4" /> {/* Question */}
        <Skeleton className="h-3 w-1/2" /> {/* State badge */}
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-3 w-full" />  {/* Entry fee */}
        <Skeleton className="h-3 w-2/3" />   {/* Players */}
        <Skeleton className="h-3 w-1/2" />   {/* Prize pool */}
        <Skeleton className="h-9 w-full" />  {/* Action button */}
      </CardContent>
    </Card>
  );
}

// Grid wrapper to show multiple skeletons
export function GameCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  );
}

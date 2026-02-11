import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div
      className="bg-card border rounded-lg p-6 space-y-4"
      role="status"
      aria-label="Loading job information"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

export function JobListingsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label={`Loading ${count} job listings`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function JobsHeroSkeleton() {
  return (
    <div className="space-y-8 text-center">
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-5/6 mx-auto" />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-6 w-px hidden sm:block" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-48 mx-auto" />
        <div className="flex flex-wrap justify-center gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-32" />
          ))}
        </div>
      </div>

      <Skeleton className="h-16 w-80 mx-auto rounded-lg" />
    </div>
  );
}

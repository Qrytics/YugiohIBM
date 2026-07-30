import { StatCardSkeleton } from '@/components/LoadingSkeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse"></div>
      <div className="space-y-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    </div>
  );
}

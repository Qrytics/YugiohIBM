import { LeaderboardSkeleton, ProfileCardSkeleton } from '@/components/LoadingSkeleton';

export default function LeaderboardsLoading() {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="animate-pulse h-10 bg-gray-200 rounded w-64 mb-6"></div>
      <ProfileCardSkeleton />
      <div className="mb-4 flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>
      <LeaderboardSkeleton rows={10} />
    </div>
  );
}

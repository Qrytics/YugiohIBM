import { StatCardSkeleton, ProfileCardSkeleton } from '@/components/LoadingSkeleton';

export default function ProfileLoading() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <ProfileCardSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="mt-4">
        <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}

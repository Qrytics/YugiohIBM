import { CollectionGridSkeleton } from '@/components/LoadingSkeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
        <div className="flex gap-4 mb-6">
          <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CollectionGridSkeleton />
        <CollectionGridSkeleton />
      </div>
    </div>
  );
}

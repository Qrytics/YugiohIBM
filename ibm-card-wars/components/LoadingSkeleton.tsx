/**
 * LoadingSkeleton - Reusable skeleton loader components
 * Provides smooth loading states for various UI elements
 */

export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 rounded-lg p-4">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 rounded w-full"></div>
        <div className="h-3 bg-gray-300 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-200">
      <td className="px-4 py-3">
        <div className="animate-pulse h-4 bg-gray-200 rounded w-12"></div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="animate-pulse w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="animate-pulse h-4 bg-gray-200 rounded w-16 mx-auto"></div>
      </td>
      <td className="px-4 py-3">
        <div className="animate-pulse h-4 bg-gray-200 rounded w-20 mx-auto"></div>
      </td>
      <td className="px-4 py-3">
        <div className="animate-pulse h-4 bg-gray-200 rounded w-16 ml-auto"></div>
      </td>
    </tr>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="bg-gray-200 animate-pulse rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
          <div>
            <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="h-12 w-12 bg-gray-300 rounded-full mx-auto mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-20"></div>
        </div>
        <div>
          <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-20"></div>
        </div>
        <div>
          <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-20"></div>
        </div>
        <div>
          <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

export function MissionCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-24"></div>
        <div className="h-10 bg-gray-300 rounded w-24"></div>
      </div>
    </div>
  );
}

export function PackCardSkeleton() {
  return (
    <div className="bg-gray-200 animate-pulse rounded-lg p-8 shadow-lg">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div className="h-5 bg-gray-300 rounded w-32 mx-auto mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-24 mx-auto"></div>
      </div>
    </div>
  );
}

export function CollectionGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function LeaderboardSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <tr>
            <th className="px-4 py-3 text-left font-bold">Rank</th>
            <th className="px-4 py-3 text-left font-bold">Player</th>
            <th className="px-4 py-3 text-center font-bold">Level</th>
            <th className="px-4 py-3 text-center font-bold">Rank</th>
            <th className="px-4 py-3 text-right font-bold">MMR</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-64 mb-6"></div>
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

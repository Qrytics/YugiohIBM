'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-8">
        <div className="text-6xl mb-4">😵</div>
        <h2 className="text-2xl font-bold text-red-800 mb-2">Failed to Load Packs</h2>
        <p className="text-red-600 mb-6">Something went wrong while loading your pack inventory.</p>
        <div className="space-y-2">
          <button
            onClick={reset}
            className="w-full px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/games/IBM-card-wars"
            className="block w-full px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Return to Main Menu
          </a>
        </div>
      </div>
    </div>
  );
}

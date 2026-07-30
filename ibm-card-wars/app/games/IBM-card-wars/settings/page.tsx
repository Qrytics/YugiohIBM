import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AudioSettings from '@/components/settings/AudioSettings';
import Link from 'next/link';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Settings</h1>
        <Link
          href="/games/IBM-card-wars"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← Back to Menu
        </Link>
      </div>

      <div className="space-y-6">
        {/* Audio Settings */}
        <AudioSettings />

        {/* Account Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {session.user.name || 'Player'}
                </p>
                <p className="text-sm text-gray-600">{session.user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gameplay Settings (Future) */}
        <div className="bg-white rounded-lg shadow-md p-6 opacity-60">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Gameplay <span className="text-sm text-gray-500">(Coming Soon)</span>
          </h2>
          <div className="space-y-3 text-gray-500">
            <div className="flex items-center justify-between">
              <span>Auto-end Turn</span>
              <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <span>Card Tooltips</span>
              <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <span>Animation Speed</span>
              <select disabled className="px-3 py-1 bg-gray-200 rounded">
                <option>Normal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Graphics Settings (Future) */}
        <div className="bg-white rounded-lg shadow-md p-6 opacity-60">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Graphics <span className="text-sm text-gray-500">(Coming Soon)</span>
          </h2>
          <div className="space-y-3 text-gray-500">
            <div className="flex items-center justify-between">
              <span>Quality</span>
              <select disabled className="px-3 py-1 bg-gray-200 rounded">
                <option>High</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span>Particle Effects</span>
              <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

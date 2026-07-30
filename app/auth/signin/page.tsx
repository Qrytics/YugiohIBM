'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        name,
        redirect: false,
      });

      if (result?.error) {
        setError('Sign in failed. Please try again.');
      } else {
        router.push('/games/IBM-card-wars');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-strong rounded-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2 text-center">
          <span className="bg-gradient-to-r from-ibm-blue via-ibm-cyan to-ibm-purple bg-clip-text text-transparent">
            IBM Card Wars
          </span>
        </h1>
        <p className="text-foreground/70 text-center mb-6">Sign in to play</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/70">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full glass px-4 py-3 rounded-lg bg-background border border-foreground/20 text-foreground focus:border-ibm-cyan outline-none"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/70">
              Name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass px-4 py-3 rounded-lg bg-background border border-foreground/20 text-foreground focus:border-ibm-cyan outline-none"
              placeholder="Your Name"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-error-red/10 border border-error-red/30 text-error-red text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full glass-strong px-6 py-3 rounded-lg font-bold text-ibm-cyan hover:bg-ibm-cyan hover:text-background transition-colors border border-ibm-cyan disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-foreground/50">
          <p>Demo mode - no password required</p>
          <p className="mt-1">Use any email to create/access an account</p>
        </div>
      </div>
    </div>
  );
}

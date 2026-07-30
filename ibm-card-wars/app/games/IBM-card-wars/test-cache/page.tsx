'use client';

export default function TestCachePage() {
  const buildTime = new Date().toISOString();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-strong rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-ibm-cyan">Cache Test</h1>
        <p className="mb-2">If you see this timestamp changing on each hard refresh, the server is working:</p>
        <p className="text-xl font-mono bg-ibm-blue/20 p-4 rounded">{buildTime}</p>
        <p className="text-sm opacity-70 mt-4">Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac) to hard refresh</p>

        <a
          href="/games/IBM-card-wars/play"
          className="inline-block mt-6 glass px-6 py-3 rounded font-bold text-ibm-cyan hover:bg-ibm-cyan hover:text-background transition-colors"
        >
          Go to Game
        </a>
      </div>
    </div>
  );
}

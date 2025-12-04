'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AnalyticsLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        // Small delay to ensure cookie is set before redirect
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur-sm">
        <h1 className="mb-6 text-3xl font-bold text-white">Analytics Login</h1>
        <p className="mb-8 text-sm text-white/60">
          Enter the password to access the analytics dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
              placeholder="Enter password"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            onClick={(e) => {
              // Fallback for environments where form onSubmit doesn't fire
              if (password && !isLoading) {
                handleSubmit(e);
              }
            }}
            className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

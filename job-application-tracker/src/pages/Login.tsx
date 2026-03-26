import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await signIn(email, password);
      // @ts-ignore
      if (res?.error) setMessage(res.error.message);
      else setMessage('Signed in successfully');
    } catch (err: any) {
      setMessage(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setMessage(null);

    try {
      const res = await signInWithGoogle();
      // @ts-ignore
      if (res?.error) setMessage(res.error.message);
    } catch (err: any) {
      setMessage(err?.message ?? String(err));
      setGoogleLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Sign in</h2>

      <div className="flex flex-col gap-3 mb-5">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="px-4 py-2 border rounded bg-white text-slate-900 hover:bg-slate-50 disabled:opacity-50"
        >
          {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
        </button>
      </div>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300 dark:border-slate-600" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
            Or use email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-2 border rounded bg-transparent"
          required
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-3 py-2 border rounded bg-transparent"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50 hover:bg-indigo-700 transition-colors"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        {message && (
          <div className="text-sm text-gray-700 dark:text-slate-300">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
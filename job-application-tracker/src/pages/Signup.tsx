import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';

export default function Signup() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await signUp(email, password);
      // @ts-ignore
      if (res?.error) setMessage(res.error.message);
      else setMessage('Signup ok — check email if confirmation is required');
    } catch (err: any) {
      setMessage(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Sign up</h2>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Create an account with email and password.
      </p>

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
          {loading ? 'Signing up…' : 'Sign up'}
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
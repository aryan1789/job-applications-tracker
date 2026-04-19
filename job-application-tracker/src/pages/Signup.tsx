import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { isDark as themeIsDark } from '../lib/theme';

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isDark = themeIsDark();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await signUp(email, password);
      if (res?.error) {
        setError(res.error.message);
      } else if (res?.data?.session) {
        // Auto-confirmed (e.g. email confirmation disabled in Supabase)
        navigate('/dashboard', { replace: true });
      } else {
        setMessage('Check your email to confirm your account.');
      }
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  const surface = isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900';
  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const input = isDark
    ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400';

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${surface}`}>
      <div className={`w-full max-w-sm rounded-2xl border shadow-xl p-8 ${card}`}>
        <h1 className="text-2xl font-semibold mb-1">Create account</h1>
        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Start tracking your job applications
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`px-3 py-2 border rounded-lg text-sm ${input}`}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`px-3 py-2 border rounded-lg text-sm ${input}`}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-indigo-700 transition-colors"
          >
            {loading ? 'Creating account…' : 'Sign up'}
          </button>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{message}</p>}
        </form>

        <p className={`mt-5 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-500 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

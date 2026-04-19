import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { isDark as themeIsDark } from '../lib/theme';

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDark = themeIsDark();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn(email, password);
      if (res?.error) {
        setError(res.error.message);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError(null);
    try {
      const res = await signInWithGoogle();
      if (res?.error) setError(res.error.message);
      // Google OAuth redirects the page, so no navigate() needed
    } catch (err: any) {
      setError(err?.message ?? String(err));
      setGoogleLoading(false);
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
        <h1 className="text-2xl font-semibold mb-1">Sign in</h1>
        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Welcome back to App Tracker
        </p>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${isDark ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-50'}`}
        >
          {googleLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className={`px-2 ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-400'}`}>
              or
            </span>
          </div>
        </div>

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
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </form>

        <p className={`mt-5 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          No account?{' '}
          <Link to="/signup" className="text-indigo-500 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

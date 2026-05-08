import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { isDark as themeIsDark } from '../lib/theme';

export default function Signup() {
  const { signInWithGoogle, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isDark = themeIsDark();

  useEffect(() => {
    if (!authLoading && user) navigate('/dashboard', { replace: true });
  }, [user, authLoading]);

  async function handleGoogleSignUp() {
    setLoading(true);
    setError(null);
    try {
      const res = await signInWithGoogle();
      if (res?.error) setError(res.error.message);
    } catch (err: any) {
      setError(err?.message ?? String(err));
      setLoading(false);
    }
  }

  const surface = isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900';
  const card = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${surface}`}>
      <div className={`w-full max-w-sm rounded-2xl border shadow-xl p-8 ${card}`}>
        <h1 className="text-2xl font-semibold mb-1">Create your account</h1>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Start tracking your job applications
        </p>

        <div className="my-8" />

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${isDark ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-50'}`}
        >
          {!loading && (
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.1-6.1C34.36 3.09 29.45 1 24 1 14.82 1 7.01 6.48 3.53 14.22l7.1 5.52C12.32 13.73 17.7 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.7c-.55 2.97-2.22 5.49-4.73 7.18l7.28 5.65C43.55 37.58 46.5 31.5 46.5 24.5z"/>
              <path fill="#FBBC05" d="M10.63 28.26A14.63 14.63 0 0 1 9.5 24c0-1.48.25-2.9.63-4.26l-7.1-5.52A23.94 23.94 0 0 0 0 24c0 3.87.93 7.52 2.57 10.74l8.06-6.48z"/>
              <path fill="#34A853" d="M24 47c5.45 0 10.02-1.8 13.35-4.88l-7.28-5.65c-1.8 1.21-4.1 1.93-6.07 1.93-6.3 0-11.68-4.23-13.37-9.74l-8.06 6.48C7.01 41.52 14.82 47 24 47z"/>
            </svg>
          )}
          {loading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <p className={`mt-6 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-500 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

/** Login and signup in one page (mode = "login" | "signup"). */
import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import GlassCard from '@/components/ui/GlassCard';
import { useAuth } from '@/context/AuthContext';

// Only follow redirects that stay on this site ("/admin" yes, "//evil.com" or "https://..." no).
const safeNext = (n) => (typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') ? n : null);

function Field({ label, error, ...props }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-300">{label}</span>
      <input className="glass-input" aria-invalid={Boolean(error)} {...props} />
      {error && <span role="alert" className="mt-1 block text-xs text-red-300">{error}</span>}
    </label>
  );
}

export default function Auth({ mode }) {
  const isSignup = mode === 'signup';
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [fields, setFields] = useState({});
  const [busy, setBusy] = useState(false);

  const where = (u) => next ?? (u.role === 'admin' ? '/admin' : '/dashboard');
  if (user) return <Navigate to={where(user)} replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFields({});
    try {
      const u = isSignup ? await signup(form) : await login(form.email, form.password);
      navigate(where(u), { replace: true });
    } catch (err) {
      setError(err.message);
      setFields(err.fields ?? {});
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-20 pt-28 sm:px-6">
      <GlassCard className="p-6">
        <h1 className="text-2xl font-bold">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="mt-1 text-sm text-slate-400">{isSignup ? 'Sign up to use SafeZone AI.' : 'Log in to continue. Admins are sent to the admin panel.'}</p>
        <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
          {isSignup && <Field label="Full name" value={form.name} onChange={set('name')} error={fields.name} autoComplete="name" required />}
          <Field label="Email" type="email" value={form.email} onChange={set('email')} error={fields.email} autoComplete="email" required />
          <Field label="Password" type="password" value={form.password} onChange={set('password')} error={fields.password} autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={isSignup ? 8 : undefined} required />
          {isSignup && <p className="text-xs text-slate-500">At least 8 characters, with a letter and a number.</p>}
          {error && !Object.keys(fields).length && <p role="alert" className="text-sm text-red-300">{error}</p>}
          <button type="submit" disabled={busy} className="btn-gradient w-full disabled:opacity-60">
            {busy ? 'Please wait...' : isSignup ? 'Sign up' : 'Log in'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-400">
          {isSignup ? 'Already have an account?' : 'New here?'}{' '}
          <Link to={isSignup ? '/login' : '/signup'} className="font-semibold text-white underline-offset-2 hover:underline">{isSignup ? 'Log in' : 'Create an account'}</Link>
        </p>
      </GlassCard>
    </main>
  );
}

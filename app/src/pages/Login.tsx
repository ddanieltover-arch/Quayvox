import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ship, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

const Login = () => {
  const { signIn, user, isAdmin, loading, configured } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const nextPath = searchParams.get('next') || '/admin';

  if (!loading && user && isAdmin) {
    return <Navigate to={nextPath.startsWith('/') ? nextPath : '/admin'} replace />;
  }

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    const { error } = await signIn(values.email.trim(), values.password);
    if (error) {
      setFormError(error);
      return;
    }
    navigate(nextPath.startsWith('/') ? nextPath : '/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-navy-900 dot-grid flex flex-col">
      <header className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-cobalt flex items-center justify-center">
            <Ship className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-text-primary">
            Quay<span className="text-cobalt">vox</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <div className="w-full max-w-md card-surface p-6 sm:p-8">
          <h1 className="font-display font-bold text-2xl text-text-primary mb-2">Admin sign in</h1>
          <p className="text-sm text-text-secondary mb-6">
            Access is invite-only. Create users in the Supabase Auth dashboard, then set{' '}
            <code className="text-cobalt">profiles.role = admin</code>.
          </p>

          {!configured && (
            <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Supabase env vars are missing. Copy <code>app/.env.example</code> to{' '}
              <code>app/.env</code> and fill in your project keys.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-mono uppercase text-text-secondary mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full min-h-11 px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-cobalt/50"
                {...register('email')}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-mono uppercase text-text-secondary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="w-full min-h-11 px-4 py-2.5 rounded-xl bg-navy-800 border border-white/10 text-text-primary text-sm focus:outline-none focus:border-cobalt/50"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {formError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !configured}
              className="btn-primary w-full min-h-11 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;

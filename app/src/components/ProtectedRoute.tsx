import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading, configured, apiError } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cobalt/30 border-t-cobalt rounded-full animate-spin" />
          <p className="text-sm text-text-secondary">Checking session…</p>
        </div>
      </div>
    );
  }

  if (!configured) {
    const isProd = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
        <div className="card-surface max-w-md p-6 text-center space-y-3">
          <h1 className="font-display font-bold text-xl text-text-primary">
            {apiError ? 'Admin API unavailable' : 'Configuration required'}
          </h1>
          <p className="text-sm text-text-secondary">
            {apiError ? (
              apiError
            ) : isProd ? (
              <>
                The admin API is not configured on Vercel. In Project Settings → Environment
                Variables (Production), set{' '}
                <code className="text-cobalt">DATABASE_URL</code>,{' '}
                <code className="text-cobalt">AUTH_SECRET</code>,{' '}
                <code className="text-cobalt">ADMIN_EMAIL</code>, and{' '}
                <code className="text-cobalt">ADMIN_PASSWORD_HASH</code>, then redeploy.
              </>
            ) : (
              <>
                Set <code className="text-cobalt">DATABASE_URL</code>,{' '}
                <code className="text-cobalt">AUTH_SECRET</code>,{' '}
                <code className="text-cobalt">ADMIN_EMAIL</code>, and{' '}
                <code className="text-cobalt">ADMIN_PASSWORD_HASH</code> in the repo root{' '}
                <code className="text-cobalt">.env</code>, then run{' '}
                <code className="text-cobalt">vercel dev</code> (API) with Vite proxied to it.
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
        <div className="card-surface max-w-md p-6 text-center space-y-3">
          <h1 className="font-display font-bold text-xl text-text-primary">Admin access required</h1>
          <p className="text-sm text-text-secondary">
            Sign in with the admin email configured in{' '}
            <code className="text-cobalt">ADMIN_EMAIL</code>.
          </p>
          <a href="/" className="btn-secondary inline-flex text-sm">
            Back to home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

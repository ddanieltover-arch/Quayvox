import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading, configured } = useAuth();
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
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
        <div className="card-surface max-w-md p-6 text-center space-y-3">
          <h1 className="font-display font-bold text-xl text-text-primary">Configuration required</h1>
          <p className="text-sm text-text-secondary">
            Set <code className="text-cobalt">VITE_SUPABASE_URL</code> and{' '}
            <code className="text-cobalt">VITE_SUPABASE_ANON_KEY</code> in{' '}
            <code className="text-cobalt">app/.env</code>, then restart the dev server.
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
            Your account is signed in but does not have the <code className="text-cobalt">admin</code> role.
            Ask an owner to run:{' '}
            <code className="block mt-2 text-xs text-left bg-navy-800 p-3 rounded-lg overflow-x-auto">
              update public.profiles set role = &apos;admin&apos; where email = &apos;you@example.com&apos;;
            </code>
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

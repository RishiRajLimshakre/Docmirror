import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/** Handles Google OAuth redirect — saves token and redirects to app */
export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setToken = useAuthStore((s) => s.setToken);
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error || !token) {
      navigate('/login?error=google_failed', { replace: true });
      return;
    }

    setToken(token);
    loadUser().then(() => navigate('/', { replace: true }));
  }, [params, setToken, loadUser, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Signing in...</p>
    </div>
  );
}

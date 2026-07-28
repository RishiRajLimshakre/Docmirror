import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FileText, Home, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function AppLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center border-b px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-blue-600">
          <FileText className="h-5 w-5" />
          DocMirror
        </Link>
        <nav className="ml-8">
          <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {user && <span className="text-sm text-gray-500">{user.name}</span>}
          <button onClick={handleLogout} className="btn-outline text-sm" title="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}


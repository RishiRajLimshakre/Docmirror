import { Outlet, Link } from 'react-router-dom';
import { FileText, Home } from 'lucide-react';

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center border-b border-border bg-card px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
          <FileText className="h-5 w-5" />
          DocMirror
        </Link>
        <nav className="ml-8">
          <Link
            to="/"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}


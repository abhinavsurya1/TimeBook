import { Outlet } from 'react-router-dom';
import { Header } from './header';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  );
}
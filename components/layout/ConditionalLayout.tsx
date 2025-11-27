'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if current route is a dashboard route
  const isDashboardRoute = 
    pathname?.startsWith('/tenant') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/staff');

  // Dashboard routes: No header/footer
  if (isDashboardRoute) {
    return <>{children}</>;
  }

  // Public routes: Show header and footer
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

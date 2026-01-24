'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const session = sessionStorage.getItem('perfecting_demo_session');
    if (session === 'true') {
      setIsAuthenticated(true);
    } else {
      router.replace('/login');
    }
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2E63CD] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export function useLogout() {
  const router = useRouter();

  const logout = () => {
    sessionStorage.removeItem('perfecting_demo_session');
    router.replace('/login');
  };

  return logout;
}

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Prevenir múltiplas execuções
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const session = sessionStorage.getItem('perfecting_demo_session');
    if (session === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.replace('/');
    }
  }, []); // Array vazio: executa apenas uma vez

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  const logout = useCallback(() => {
    sessionStorage.removeItem('perfecting_demo_session');
    router.replace('/');
  }, [router]);

  return logout;
}

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

    // Verificar access_token (nome correto do token)
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.replace('/');
    }
  }, [router]); // Array vazio: executa apenas uma vez

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
    localStorage.removeItem('access_token');
    localStorage.removeItem('perfecting_agent_link');
    router.replace('/');
  }, [router]);

  return logout;
}

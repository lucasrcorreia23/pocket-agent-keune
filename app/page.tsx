'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DiamondIcon } from './components/diamond-background';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    sessionStorage.setItem('perfecting_demo_session', 'true');
    router.push('/app');
  };

  return (
    <main className="backdrop-blur-md min-h-screen flex flex-col items-center justify-center p-4">
      <header className="fixed top-0 left-0 right-0 z-20 px-6 py-5">
        <div className="flex items-center justify-center">
          <span className="text-lg font-semibold text-slate-900 tracking-tight font-raleway">
            Perfecting
          </span>
        </div>
      </header>

      <div className="relative  z-10 flex flex-col items-center gap-8 w-full max-w-sm">
        <div className="w-full bg-white/70 backdrop-blur-xl border border-white/60 rounded-none p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Bem-vindo
            </h2>
            <p className="text-slate-500 text-sm">
              Acesse para conversar com nosso agente de voz
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="space-y-2 text-left ">
              <label className="text-sm font-medium text-slate-700 ">Login</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu.email@exemplo.com"
                className="mt-2 w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-sm font-medium text-slate-700">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                className="w-full mt-2 px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full h-12 px-6 bg-[#2E63CD] hover:bg-[#3A71DB] text-white font-medium rounded-none transition-all duration-200 active:scale-[0.98]"
          >
            Entrar
          </button>
        </div>
      </div>
    </main>
  );
}

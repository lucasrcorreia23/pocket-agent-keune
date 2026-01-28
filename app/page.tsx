'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DiamondIcon } from './components/diamond-background';
import { signup, login, getAgentLink, type SignupData } from './lib/auth-service';
import { testSignup, testAgentLink, testFullFlow } from './lib/api-test';

type FormMode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserTime = (): string => {
    // Formato esperado pela API: "HH:mm:ss.sssZ" (ex: "01:08:06.484Z")
    const now = new Date();
    return now.toISOString().split('T')[1];
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validar campos antes de enviar
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Por favor, insira um email válido.');
        setLoading(false);
        return;
      }

      // Validar senha (mínimo 6 caracteres)
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        setLoading(false);
        return;
      }

      // Usar função de teste detalhada para descobrir como a autenticação funciona
      const userData = {
        name: name.trim(),
        email: email.trim(),
        password,
      };

      const userTime = getUserTime(); // Formato: "10:30"

      console.log('🚀 INICIANDO TESTE COMPLETO DO FLUXO');
      console.log('📋 Dados do formulário:', { ...userData, password: '***' });
      console.log('⏰ User Time:', userTime);

      // Executar teste completo que loga TUDO
      const testResult = await testFullFlow(userData, userTime);

      // Verificar resultados
      if (!testResult.signup.success) {
        const errorMsg = testResult.signup.data?.error || testResult.signup.data?.detail || 'Erro ao criar conta';
        setError(errorMsg);
        setLoading(false);
        return;
      }

      // Salvar access_token do login
      if (testResult.login?.success && testResult.login.data?.access_token) {
        localStorage.setItem('access_token', testResult.login.data.access_token);
        console.log('✅ Access token salvo no localStorage');
      }

      // Verificar se conseguiu obter o agent link
      const agentLinkResult = testResult.agentLink;

      if (agentLinkResult?.success && agentLinkResult.data) {
        const agentLink = agentLinkResult.data.signed_url ||
                         agentLinkResult.data.link ||
                         agentLinkResult.data.agent_link;

        if (agentLink && typeof agentLink === 'string') {
          localStorage.setItem('perfecting_agent_link', agentLink);
          console.log('✅ Link do agente salvo no localStorage');
        }

        // Redirecionar para /app
        router.push('/app');
      } else {
        // Se não conseguiu o link, mostrar erro mas manter dados do teste
        setError('Conta criada, mas não foi possível obter o link do agente. Verifique o console para mais detalhes.');
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Signup error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao processar cadastro. Verifique o console para mais detalhes.');
      }
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, preencha email e senha.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validar campos
      if (!email.trim() || !password.trim()) {
        setError('Por favor, preencha email e senha.');
        setLoading(false);
        return;
      }

      // Usar função de login normal (já tem logs)
      await login(email.trim(), password);
      console.log('✅ Login - Token obtido e salvo no localStorage');

      // Obter link do agente
      const userTime = getUserTime(); // Formato: "10:30"
      const agentLinkResponse = await getAgentLink(userTime);
      console.log('✅ Login - Link do agente obtido');

      // Salvar link do agente se retornado
      const agentLink = agentLinkResponse.signed_url || (agentLinkResponse as any).link || (agentLinkResponse as any).agent_link;
      if (agentLink && typeof agentLink === 'string') {
        localStorage.setItem('perfecting_agent_link', agentLink);
      }

      // Redirecionar para /app
      router.push('/app');
    } catch (err) {
      console.error('❌ Login error:', err);
      if (err instanceof Error) {
        // Tratar mensagens específicas
        let errorMessage = err.message;
        if (errorMessage.toLowerCase().includes('not authenticated') || errorMessage.toLowerCase().includes('unauthorized')) {
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
        }
        setError(errorMessage);
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup') {
      handleSignup();
    } else {
      handleLogin();
    }
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

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm">
        <div className="w-full bg-white/70 backdrop-blur-xl border border-white/60 rounded-none p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              {mode === 'signup' ? 'Criar Conta' : 'Bem-vindo'}
            </h2>
            <p className="text-slate-500 text-sm">
              {mode === 'signup'
                ? 'Cadastre-se para conversar com nosso agente de voz'
                : 'Acesse para conversar com nosso agente de voz'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {mode === 'signup' && (
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-slate-700">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome completo"
                  required
                  className="mt-2 w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
                />
              </div>
            )}
            <div className="space-y-2 text-left">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu.email@exemplo.com"
                required
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
                required
                className="w-full mt-2 px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-none p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 px-6 bg-[#2E63CD] hover:bg-[#3A71DB] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-none transition-all duration-200 active:scale-[0.98]"
            >
              {loading ? 'Processando...' : mode === 'signup' ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signup' ? 'login' : 'signup');
                setError(null);
              }}
              className="text-sm font-medium text-[#2E63CD] hover:text-slate-700 transition-colors"
            >
              {mode === 'signup'
                ? 'Já tem uma conta? Entrar'
                : 'Não tem uma conta? Criar conta'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

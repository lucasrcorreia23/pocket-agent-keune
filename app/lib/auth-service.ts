/**
 * Serviço de autenticação para API Specialist Consultant
 * Centraliza todas as chamadas de API relacionadas à autenticação
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.perfecting.app/specialist_consultant';

export interface SignupData {
  name: string;
  email: string;
  password: string;
  nickname?: string;
  phone_number?: string;
  gender_slug?: string;
  address_country_slug?: string;
  address_state_slug?: string;
  address_city?: string;
  cell_phone?: string;
  company?: string;
  company_site?: string;
  position?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  nickname?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AgentLinkResponse {
  signed_url: string;
}

/**
 * Função helper para adicionar token automaticamente nas requisições
 */
function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Cadastrar novo usuário
 * Chama API route /api/signup que por sua vez chama /create_users/create
 */
export async function signup(userData: SignupData): Promise<User> {
  console.log('Signup - Enviando dados:', { ...userData, password: '***' });
  
  // Chamar API route do Next.js (que chama a API externa)
  const response = await fetch('/api/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  
  console.log('Signup - Resposta completa:', {
    status: response.status,
    ok: response.ok,
    data: data,
    dataKeys: Object.keys(data),
  });

  if (!response.ok) {
    // Tratar erro 409 (usuário já existe)
    if (response.status === 409) {
      throw new Error('Usuário já cadastrado. Faça login para continuar.');
    }
    
    // Tratar erro 400 (validação)
    if (response.status === 400 || response.status === 422) {
      const errorMessage = data.detail?.[0]?.msg || data.message || data.error || 'Erro de validação';
      throw new Error(errorMessage);
    }
    
    throw new Error(data.message || data.error || 'Erro ao criar usuário');
  }

  // Signup não retorna token, apenas dados do usuário
  return data as User;
}

/**
 * Fazer login e obter access_token
 * Chama API route /api/login que tenta diferentes endpoints
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  console.log('Login - Tentando fazer login para:', email);
  
  // Chamar API route do Next.js (que tenta diferentes endpoints)
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  
  console.log('Login - Resposta completa:', {
    status: response.status,
    ok: response.ok,
    data: data,
    dataKeys: Object.keys(data),
  });

  if (!response.ok) {
    const errorMessage = data.error || data.message || 'Erro ao fazer login. Verifique as credenciais.';
    throw new Error(errorMessage);
  }

  // Verificar se tem access_token
  const accessToken = data.access_token || data.accessToken || data.token;
  if (!accessToken) {
    console.error('Login - Token não encontrado na resposta:', data);
    throw new Error('Token não retornado pela API. Verifique as credenciais.');
  }

  // Salvar token no localStorage
  localStorage.setItem('access_token', accessToken);
  console.log('Login - Token salvo no localStorage');
  
  return {
    access_token: accessToken,
    token_type: data.token_type || 'bearer',
  };
}

/**
 * Obter link do agente
 * Chama API route /api/get-agent-link que por sua vez chama GET /api_agent_link/taxweb?user_time=10:30
 */
export async function getAgentLink(userTime: string): Promise<AgentLinkResponse> {
  console.log('GetAgentLink - Obtendo link com user_time:', userTime);
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  if (!token) {
    throw new Error('Token de autenticação não encontrado. Faça login novamente.');
  }

  // Chamar API route do Next.js (que chama a API externa)
  // Formato: HH:mm (ex: "10:30")
  const url = `/api/get-agent-link?user_time=${encodeURIComponent(userTime)}`;
  
  console.log('GetAgentLink - URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  
  console.log('GetAgentLink - Resposta:', {
    status: response.status,
    ok: response.ok,
    data: data,
  });

  if (!response.ok) {
    // Tratar erro 401 (token expirado)
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    
    // Tratar erro 403 (sem permissão)
    if (response.status === 403) {
      throw new Error('Você não tem permissão para acessar o agente. Verifique se o recurso specialist_consultant está habilitado.');
    }
    
    throw new Error(data.error || data.message || 'Erro ao obter link do agente');
  }

  return data as AgentLinkResponse;
}

/**
 * Fazer logout (limpar token)
 */
export function logout(): void {
  localStorage.removeItem('access_token');
  console.log('Logout - Token removido do localStorage');
}

/**
 * Verificar se usuário está autenticado
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('access_token');
}

/**
 * Obter token atual
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

/**
 * Funções de teste para descobrir como a autenticação funciona na API
 * Estas funções fazem logs detalhados de todas as respostas
 * 
 * IMPORTANTE: Estas funções chamam as API routes do Next.js (que fazem proxy para a API externa)
 * para evitar problemas de CORS
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.perfecting.app/specialist_consultant';

export interface SignupTestData {
  name: string;
  email: string;
  password: string;
  nickname?: string;
  cell_phone?: string;
}

/**
 * Teste detalhado de signup - loga TUDO que retorna
 * Usa a API route do Next.js para evitar CORS
 */
export async function testSignup(userData: SignupTestData) {
  console.group('🔍 TESTE SIGNUP - Análise Completa');
  console.log('📤 Dados enviados:', { ...userData, password: '***' });
  console.log('🌐 Chamando API route local: /api/signup (que faz proxy para API externa)');
  
  try {
    // Chamar API route local do Next.js (que faz proxy para API externa)
    // Isso evita problemas de CORS
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Importante: inclui cookies
      body: JSON.stringify(userData),
    });

    // Logar TODOS os headers da resposta
    console.log('📥 HEADERS DA RESPOSTA:');
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
      console.log(`  ${key}: ${value}`);
    });
    console.log('📥 Headers como objeto:', headers);

    // Verificar cookies
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      console.log('🍪 COOKIES RECEBIDOS:', setCookieHeader);
    } else {
      console.log('🍪 Nenhum cookie recebido');
    }

    // Ler o body
    const contentType = response.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);

    let data: any;
    const text = await response.text();
    console.log('📄 Body como texto (raw):', text);

    try {
      data = JSON.parse(text);
      console.log('📄 Body como JSON:', data);
      console.log('📄 Chaves do JSON:', Object.keys(data));
    } catch (e) {
      console.log('⚠️ Body não é JSON válido');
      data = text;
    }

    // Status e informações gerais
    console.log('📊 STATUS:', response.status);
    console.log('📊 Status Text:', response.statusText);
    console.log('📊 OK:', response.ok);
    console.log('📊 URL:', response.url);
    console.log('📊 Redirected:', response.redirected);
    console.log('📊 Type:', response.type);

    // Verificar se há token em algum lugar
    console.log('🔑 PROCURANDO TOKEN:');
    if (data?.token) {
      console.log('  ✅ Token encontrado em data.token:', data.token.substring(0, 20) + '...');
    }
    if (data?.access_token) {
      console.log('  ✅ Access token encontrado em data.access_token:', data.access_token.substring(0, 20) + '...');
    }
    if (data?.accessToken) {
      console.log('  ✅ Access token encontrado em data.accessToken:', data.accessToken.substring(0, 20) + '...');
    }
    if (data?.auth_token) {
      console.log('  ✅ Auth token encontrado em data.auth_token:', data.auth_token.substring(0, 20) + '...');
    }
    if (headers['authorization']) {
      console.log('  ✅ Authorization header encontrado:', headers['authorization']);
    }
    if (setCookieHeader) {
      console.log('  ✅ Cookie encontrado (pode conter token):', setCookieHeader);
    }
    if (!data?.token && !data?.access_token && !data?.accessToken && !data?.auth_token && !setCookieHeader) {
      console.log('  ⚠️ Nenhum token encontrado na resposta');
    }

    // Armazenar cookies se houver
    if (setCookieHeader) {
      // O browser gerencia cookies automaticamente com credentials: 'include'
      console.log('💾 Cookies serão armazenados automaticamente pelo browser');
    }

    // Retornar dados completos
    const result = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers,
      cookies: setCookieHeader,
      data,
      rawText: text,
    };

    console.groupEnd();
    return result;
  } catch (error) {
    console.error('❌ ERRO NO TESTE SIGNUP:', error);
    console.groupEnd();
    throw error;
  }
}

/**
 * Teste detalhado de login - obtém o token de acesso
 * Usa a API route do Next.js para evitar CORS
 */
export async function testLogin(email: string, password: string) {
  console.group('🔍 TESTE LOGIN - Análise Completa');
  console.log('📤 Dados enviados:', { email, password: '***' });
  console.log('🌐 Chamando API route local: /api/login');

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const text = await response.text();
    console.log('📄 Body como texto (raw):', text);

    let data: any;
    try {
      data = JSON.parse(text);
      console.log('📄 Body como JSON:', data);
      console.log('📄 Chaves do JSON:', Object.keys(data));
    } catch (e) {
      console.log('⚠️ Body não é JSON válido');
      data = text;
    }

    console.log('📊 STATUS:', response.status);
    console.log('📊 OK:', response.ok);

    if (data?.access_token) {
      console.log('✅ Access token obtido:', data.access_token.substring(0, 30) + '...');
    }

    const result = {
      success: response.ok,
      status: response.status,
      data,
      rawText: text,
    };

    console.groupEnd();
    return result;
  } catch (error) {
    console.error('❌ ERRO NO TESTE LOGIN:', error);
    console.groupEnd();
    throw error;
  }
}

/**
 * Teste detalhado de agent link - testa diferentes formas de autenticação
 * Usa a API route do Next.js para evitar CORS
 */
export async function testAgentLink(userTime: string, authMethod?: {
  type: 'bearer' | 'cookie' | 'header';
  value?: string;
  headerName?: string;
}) {
  console.group('🔍 TESTE AGENT LINK - Análise Completa');
  console.log('📤 User Time (recebido):', userTime);
  console.log('🔑 Método de autenticação:', authMethod || 'Nenhum (testando sem auth)');

  // Formato esperado pela API: "23:37:08.837Z" ou "10:30 AM" ou "10:30"
  // Vamos testar com o formato que o usuário forneceu
  const formattedTime = userTime;
  const url = `/api/get-agent-link?user_time=${encodeURIComponent(formattedTime)}`;
  console.log('📤 User Time (enviado):', formattedTime);
  console.log('🌐 Chamando API route local:', url);
  console.log('📤 URL completa (via proxy):', url);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Adicionar autenticação baseado no método
  if (authMethod) {
    if (authMethod.type === 'bearer' && authMethod.value) {
      headers['Authorization'] = `Bearer ${authMethod.value}`;
      console.log('🔑 Adicionando Authorization Bearer header');
    } else if (authMethod.type === 'header' && authMethod.headerName && authMethod.value) {
      headers[authMethod.headerName] = authMethod.value;
      console.log(`🔑 Adicionando header customizado: ${authMethod.headerName}`);
    } else if (authMethod.type === 'cookie') {
      console.log('🔑 Usando cookies (serão enviados automaticamente)');
    }
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include', // Importante: inclui cookies
    });

    // Logar TODOS os headers da resposta
    console.log('📥 HEADERS DA RESPOSTA:');
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
      console.log(`  ${key}: ${value}`);
    });
    console.log('📥 Headers como objeto:', responseHeaders);

    // Ler o body
    const text = await response.text();
    console.log('📄 Body como texto (raw):', text);

    let data: any;
    try {
      data = JSON.parse(text);
      console.log('📄 Body como JSON:', data);
      console.log('📄 Chaves do JSON:', Object.keys(data));
    } catch (e) {
      console.log('⚠️ Body não é JSON válido');
      data = text;
    }

    // Status e informações gerais
    console.log('📊 STATUS:', response.status);
    console.log('📊 Status Text:', response.statusText);
    console.log('📊 OK:', response.ok);
    console.log('📊 URL:', response.url);

    // Verificar se obteve o link
    if (data?.signed_url) {
      console.log('✅ Signed URL obtido:', data.signed_url.substring(0, 50) + '...');
    } else if (data?.link) {
      console.log('✅ Link obtido:', data.link.substring(0, 50) + '...');
    } else if (data?.agent_link) {
      console.log('✅ Agent link obtido:', data.agent_link.substring(0, 50) + '...');
    } else {
      console.log('⚠️ Nenhum link encontrado na resposta');
    }

    const result = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data,
      rawText: text,
    };

    console.groupEnd();
    return result;
  } catch (error) {
    console.error('❌ ERRO NO TESTE AGENT LINK:', error);
    console.groupEnd();
    throw error;
  }
}

/**
 * Teste completo do fluxo: signup -> login -> agent link
 */
export async function testFullFlow(userData: SignupTestData, userTime: string) {
  console.group('🚀 TESTE FLUXO COMPLETO');

  // Passo 1: Signup
  console.log('📝 PASSO 1: Signup');
  const signupResult = await testSignup(userData);

  // Signup pode falhar com 409 se usuário já existe - isso é OK, podemos fazer login
  if (!signupResult.success && signupResult.status !== 409) {
    console.error('❌ Signup falhou, abortando teste');
    console.groupEnd();
    return { signup: signupResult, login: null, agentLink: null };
  }

  // Passo 2: Login para obter token
  console.log('\n📝 PASSO 2: Login');
  const loginResult = await testLogin(userData.email, userData.password);

  if (!loginResult.success) {
    console.error('❌ Login falhou, abortando teste');
    console.groupEnd();
    return { signup: signupResult, login: loginResult, agentLink: null };
  }

  const accessToken = loginResult.data?.access_token;
  if (!accessToken) {
    console.error('❌ Login não retornou access_token');
    console.groupEnd();
    return { signup: signupResult, login: loginResult, agentLink: null };
  }

  // Passo 3: Obter agent link com o token
  console.log('\n📝 PASSO 3: Obtendo Agent Link com Bearer token');
  const agentLinkResult = await testAgentLink(userTime, {
    type: 'bearer',
    value: accessToken,
  });

  console.groupEnd();

  return {
    signup: signupResult,
    login: loginResult,
    agentLink: agentLinkResult,
  };
}

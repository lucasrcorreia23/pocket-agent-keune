import { NextRequest, NextResponse } from 'next/server';

interface SignupRequest {
  name: string;
  email: string;
  password: string;
  nickname?: string;
  gender_slug?: string;
  address_country_slug?: string;
  address_state_slug?: string;
  address_city?: string;
  cell_phone?: string;
  company?: string;
  company_site?: string;
  position?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json();

    // Validar campos obrigatórios
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, email, password' },
        { status: 400 }
      );
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      return NextResponse.json(
        { error: 'Server configuration error: API base URL not set' },
        { status: 500 }
      );
    }

    // Endpoint correto: POST /specialist_consultant/create_user/keune
    const response = await fetch(`${apiBaseUrl}/create_user/keune`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Importante: inclui cookies
      body: JSON.stringify(body),
    });

    // Logar TODOS os headers da resposta
    console.log('📥 SIGNUP API ROUTE - HEADERS DA RESPOSTA:');
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
      console.log(`  ${key}: ${value}`);
    });

    // Verificar cookies
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      console.log('🍪 COOKIES RECEBIDOS:', setCookieHeader);
    } else {
      console.log('🍪 Nenhum cookie recebido');
    }

    const data = await response.json();

    // Log detalhado para debug
    console.log('📊 Signup API Route - Resposta completa:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url,
      headers: responseHeaders,
      cookies: setCookieHeader,
      data: data,
      dataKeys: Object.keys(data),
    });

    // Verificar se há token em algum lugar
    console.log('🔑 PROCURANDO TOKEN NA RESPOSTA:');
    if (data?.token) {
      console.log('  ✅ Token encontrado em data.token');
    }
    if (data?.access_token) {
      console.log('  ✅ Access token encontrado em data.access_token');
    }
    if (data?.accessToken) {
      console.log('  ✅ Access token encontrado em data.accessToken');
    }
    if (setCookieHeader) {
      console.log('  ✅ Cookie encontrado (pode conter token)');
    }

    if (!response.ok) {
      // Tratar erro 409 (usuário já existe)
      if (response.status === 409) {
        return NextResponse.json(
          { error: 'Usuário já cadastrado. Faça login para continuar.', details: data },
          { status: 409 }
        );
      }
      
      // Tratar erro 400/422 (validação)
      if (response.status === 400 || response.status === 422) {
        const errorMessage = data.detail?.[0]?.msg || data.message || data.error || 'Erro de validação';
        return NextResponse.json(
          { error: errorMessage, details: data },
          { status: response.status }
        );
      }
      
      // Retornar erro de validação (422) ou outros erros
      return NextResponse.json(
        { error: data.detail || data.message || 'Erro ao criar usuário', details: data },
        { status: response.status }
      );
    }

    // Retornar dados do usuário criado + headers e cookies para análise
    const responseToClient = NextResponse.json(data, { status: response.status });
    
    // Repassar cookies se houver
    if (setCookieHeader) {
      responseToClient.headers.set('set-cookie', setCookieHeader);
      console.log('🍪 Cookie repassado para o cliente');
    }
    
    return responseToClient;
  } catch (error) {
    console.error('Error in signup:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Auth endpoints usam a base https://api.perfecting.app (sem /specialist_consultant)
    const authBaseUrl = apiBaseUrl.replace('/specialist_consultant', '');

    // OAuth2 password flow - form-urlencoded
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', email); // API usa username, enviamos email
    formData.append('password', password);

    console.log('Login API Route - Enviando para:', `${authBaseUrl}/auth/login`);

    const response = await fetch(`${authBaseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    console.log('Login API Route - Resposta:', {
      status: response.status,
      ok: response.ok,
      data: data,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Credenciais inválidas' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type,
      user_scope: data.user_scope,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

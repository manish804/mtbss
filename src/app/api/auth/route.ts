import { NextRequest, NextResponse } from 'next/server';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    const { username, password, action } = await request.json();

    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin-auth', '', {
        httpOnly: true,
        secure: request.url.startsWith('https://'),
        sameSite: 'lax',
        maxAge: 0
      });
      return response;
    }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true });
      
      response.cookies.set('admin-auth', 'authenticated', {
        httpOnly: true,
        secure: request.url.startsWith('https://'),
        sameSite: 'lax',
        maxAge: 60 * 60 * 24
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

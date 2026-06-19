import { NextResponse } from 'next/server';
import { createAdminSession } from '@/lib/admin-auth';
import { verifyTotp } from '@/lib/totp';

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '').trim();
  const code = String(formData.get('code') ?? '').trim();

  if (!username || !password || !code) {
    return NextResponse.json({ error: 'Login id, password, and 2FA code are required.' }, { status: 400 });
  }

  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  if (!verifyTotp(process.env.ADMIN_2FA_SECRET, code)) {
    return NextResponse.json({ error: 'Invalid 2FA code.' }, { status: 401 });
  }

  const token = createAdminSession(username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: 'portfolio_admin_session',
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 12,
  });

  return response;
}

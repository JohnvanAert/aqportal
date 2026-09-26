import { cookies } from 'next/headers';

export async function createSession(userData: {
  userId: string;
  email: string;
  role: string;
  name?: string;
}) {
  const cookieStore = await cookies();
  cookieStore.set('session', JSON.stringify(userData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    if (!sessionCookie) return null;
    return JSON.parse(sessionCookie.value);
  } catch (err) {
    return null;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { sessions } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    // Получаем sessionId из заголовка запроса
    const sessionId = req.headers.get('x-session-id');

    if (sessionId) {
      // Удаляем сессию из базы данных
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
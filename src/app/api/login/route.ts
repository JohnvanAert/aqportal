import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createSession } from '@/src/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }
    
    // 🛑 Проверка на блокировку
    if (user.isBlocked) {
      return NextResponse.json(
        { error: 'Ваш аккаунт заблокирован администратором' },
        { status: 403 }
      );
    }

    // Запрещаем вход обычным читателям (USER)
    if (user.role === 'USER') {
      return NextResponse.json(
        { error: 'У вас нет прав для входа в панель управления' },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Создаем сессию с JWT-кукой
    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || undefined,
    });

    return NextResponse.json({ success: true, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
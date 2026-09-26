import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createSession } from '@/src/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
    }

    // Ищем пользователя в БД
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
    }

    // Проверяем роль: обычным пользователям вход в панель закрыт
    if (user.role === 'USER') {
      return NextResponse.json(
        { error: 'У вас нет доступа к административной панели' },
        { status: 403 }
      );
    }

    // Сравниваем пароли
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
    }

    // Записываем сессию в HTTP-only куки
    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || undefined,
    });

    return NextResponse.json({ success: true, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
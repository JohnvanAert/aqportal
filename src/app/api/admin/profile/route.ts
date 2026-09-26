import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { getSession } from '@/src/lib/auth';

// 1. Получить данные текущего профиля
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// 2. Обновить профиль (Имя, Пароль)
export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { name, newPassword } = await req.json();

    const updateData: { name?: string; password?: string } = {};

    if (name) updateData.name = name;
    if (newPassword && newPassword.trim().length > 0) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    await db.update(users).set(updateData).where(eq(users.id, session.userId));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: 'Ошибка обновления профиля' }, { status: 500 });
  }
}
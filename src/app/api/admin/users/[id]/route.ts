import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/src/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    // Изменять роли может ТОЛЬКО Главный Администратор (ADMIN)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const { id } = await params;
    const { role } = await req.json();

    if (!['USER', 'EDITOR', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Неверная роль' }, { status: 400 });
    }

    await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Update user role error:', err);
    return NextResponse.json({ error: ' Ошибка сервера' }, { status: 500 });
  }
}
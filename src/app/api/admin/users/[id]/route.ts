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
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const updateData: Record<string, any> = {};

    // Если передан флаг блокировки
    if (typeof body.isBlocked === 'boolean') {
      updateData.isBlocked = body.isBlocked;
    }

    // Если передана роль
    if (body.role) {
      if (!['USER', 'EDITOR', 'ADMIN'].includes(body.role)) {
        return NextResponse.json({ error: 'Неверная роль' }, { status: 400 });
      }
      updateData.role = body.role;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Update user error:', err);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
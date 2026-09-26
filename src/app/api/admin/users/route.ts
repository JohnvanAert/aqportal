import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getSession } from '@/src/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    return NextResponse.json({ users: allUsers });
  } catch (err) {
    console.error('Fetch users error:', err);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const { email, password, name, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Заполните обязательные поля (Email, Пароль)' }, { status: 400 });
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Пользователь с таким Email уже существует' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name?.trim() || null,
        role: role || 'USER',
      })
      .returning();

    return NextResponse.json({ success: true, user: newUser });
  } catch (err) {
    console.error('Create user error:', err);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
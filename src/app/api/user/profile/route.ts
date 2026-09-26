import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { users, bookmarks, articles, categories } from '@/src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: 'Недействительная сессия' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const userBookmarks = await db
      .select({
        bookmarkId: bookmarks.id,
        savedAt: bookmarks.createdAt,
        article: {
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          imageUrl: articles.imageUrl,
          publishedAt: articles.publishedAt,
          categoryName: categories.name,
        },
      })
      .from(bookmarks)
      .innerJoin(articles, eq(bookmarks.articleId, articles.id))
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(bookmarks.userId, user.id))
      .orderBy(desc(bookmarks.createdAt));

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      bookmarks: userBookmarks,
    });
  } catch (err) {
    console.error('Fetch profile error:', err);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const { name, currentPassword, newPassword } = await req.json();

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const updateData: { name?: string; password?: string } = {};
    if (name) updateData.name = name.trim();

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Укажите текущий пароль' }, { status: 400 });
      }
      if (user.password) {
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
          return NextResponse.json({ error: 'Неверный текущий пароль' }, { status: 400 });
        }
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    await db.update(users).set(updateData).where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { articles } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/src/lib/auth';

// 1. Получение статьи
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await db.query.articles.findFirst({
      where: eq(articles.id, id),
    });

    if (!article) {
      return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (err) {
    console.error('Fetch article error:', err);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// 2. Обновление статьи (PUT)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const { id } = await params;
    const { title, content, summary, categoryId, imageUrl, isHero } = await req.json();

    if (!title || !content || !categoryId) {
      return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 });
    }

    if (isHero) {
      await db.update(articles).set({ isHero: false }).where(eq(articles.isHero, true));
    }

    const [updatedArticle] = await db
      .update(articles)
      .set({
        title,
        content,
        summary: summary || null,
        imageUrl: imageUrl || null,
        categoryId,
        isHero: Boolean(isHero),
      })
      .where(eq(articles.id, id))
      .returning();

    return NextResponse.json({ success: true, article: updatedArticle });
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ error: 'Ошибка при обновлении статьи' }, { status: 500 });
  }
}

// 3. Удаление статьи (DELETE)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const { id } = await params;
    await db.delete(articles).where(eq(articles.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json({ error: 'Ошибка при удалении статьи' }, { status: 500 });
  }
}
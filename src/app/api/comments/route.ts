import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { comments } from '@/src/db/schema';
import { getSession } from '@/src/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Авторизуйтесь для отправки комментариев' }, { status: 401 });
    }

    const { articleId, text, parentId } = await req.json();

    if (!articleId || !text || !text.trim()) {
      return NextResponse.json({ error: 'Введите текст комментария' }, { status: 400 });
    }

    const [newComment] = await db
      .insert(comments)
      .values({
        articleId,
        userId: session.userId,
        text: text.trim(),
        parentId: parentId || null,
      })
      .returning();

    return NextResponse.json({ success: true, comment: newComment });
  } catch (err) {
    console.error('Create comment error:', err);
    return NextResponse.json({ error: 'Ошибка при отправке комментария' }, { status: 500 });
  }
}
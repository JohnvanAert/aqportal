import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { categories } from '@/src/db/schema';
import { getSession } from '@/src/lib/auth';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// Получить список категорий
export async function GET() {
  try {
    const allCategories = await db.select().from(categories);
    return NextResponse.json({ categories: allCategories });
  } catch (err) {
    console.error('Fetch categories error:', err);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// Создать новую двуязычную категорию
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const { name, nameKk } = await req.json();

    if (!name || !nameKk) {
      return NextResponse.json(
        { error: 'Укажите название категории на русском и казахском!' },
        { status: 400 }
      );
    }

    const slug = slugify(name);

    const [newCategory] = await db
      .insert(categories)
      .values({
        name,
        nameKk,
        slug,
      })
      .returning();

    return NextResponse.json({ success: true, category: newCategory });
  } catch (err) {
    console.error('Create category error:', err);
    return NextResponse.json({ error: 'Ошибка при создании категории' }, { status: 500 });
  }
}
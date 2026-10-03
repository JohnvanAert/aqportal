import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { articles } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/src/lib/auth';

// Функция транслитерации для генерации понятного slug (с поддержкой казахских букв)
function slugify(text: string): string {
  const ru: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
    з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
    ә: 'a', ғ: 'g', қ: 'q', ң: 'n', ө: 'o', ұ: 'u', ү: 'u', h: 'h', і: 'i',
  };

  return text
    .toLowerCase()
    .split('')
    .map((char) => ru[char] || char)
    .join('')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || (session.role !== 'ADMIN' && session.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    // 1. Принимаем все языковые поля из тела запроса
    const {
      title,
      content,
      summary,
      titleKk,
      contentKk,
      summaryKk,
      titleEn,
      contentEn,
      summaryEn,
      categoryId,
      imageUrl,
      imageSource,
      isHero,
    } = await req.json();

    // 2. Обязательная проверка заполненности всех 3-х языков
    if (!title || !title.trim() || !content || !content.trim() || !summary || !summary.trim()) {
      return NextResponse.json(
        { error: 'Заполните все поля на русском языке (Заголовок, Краткое описание, Текст)' },
        { status: 400 }
      );
    }

    if (!titleKk || !titleKk.trim() || !contentKk || !contentKk.trim() || !summaryKk || !summaryKk.trim()) {
      return NextResponse.json(
        { error: 'Заполните все поля на казахском языке (Қазақша)' },
        { status: 400 }
      );
    }

    if (!titleEn || !titleEn.trim() || !contentEn || !contentEn.trim() || !summaryEn || !summaryEn.trim()) {
      return NextResponse.json(
        { error: 'Заполните все поля на английском языке (English)' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Выберите категорию новости' },
        { status: 400 }
      );
    }

    let slug = slugify(title);
    if (!slug) slug = `article-${Date.now()}`;

    // Проверяем уникальность slug
    const existingArticle = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
    });

    if (existingArticle) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Если создается главная новость (Hero), сбрасываем флаг isHero у старой
    if (isHero) {
      await db.update(articles).set({ isHero: false }).where(eq(articles.isHero, true));
    }

    // 3. Записываем поля во все колонки базы данных вместе с authorId
    const [newArticle] = await db
      .insert(articles)
      .values({
        // Русский язык
        title: title.trim(),
        content: content.trim(),
        summary: summary.trim(),

        // Казахский язык
        titleKk: titleKk.trim(),
        contentKk: contentKk.trim(),
        summaryKk: summaryKk.trim(),

        // Английский язык
        titleEn: titleEn.trim(),
        contentEn: contentEn.trim(),
        summaryEn: summaryEn.trim(),

        slug,
        imageUrl: imageUrl || null,
        imageSource: imageSource ? imageSource.trim() : null,
        imageSourceKk: imageSource ? imageSource.trim() : null,
        imageSourceEn: imageSource ? imageSource.trim() : null,
        categoryId,
        isHero: Boolean(isHero),
        authorId: (session as any).id || (session as any).userId, // 👈 Привязка ID текущего администратора или редактора
      })
      .returning();

    return NextResponse.json({ success: true, article: newArticle });
  } catch (err) {
    console.error('Create article error:', err);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
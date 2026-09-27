import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/src/db';
import { articles, categories, comments, users } from '@/src/db/schema';
import { eq, sql, desc, ne, and } from 'drizzle-orm';
import { Eye, ArrowLeft, Calendar, Search, User, MessageSquare, LogIn } from 'lucide-react';
import { getSession } from '@/src/lib/auth';
import { cookies } from 'next/headers';
import ShareButtons from '@/src/components/ShareButtons';
import CommentForm from '@/src/components/CommentForm';
import CommentItem, { CommentType } from '@/src/components/CommentItem';
import LanguageSwitcher from '@/src/components/LanguageSwitcher';
import { dictionaries, getLocalizedField, Locale } from '@/src/lib/i18n';
import CommentListWrapper from '@/src/components/CommentListWrapper';

export const revalidate = 0; // Всегда свежие данные + инкремент просмотров

interface NewsPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    lang?: string;
  }>;
}

export default async function NewsDetailPage({ params, searchParams }: NewsPageProps) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const session = await getSession();

  // Определение локали (из URL или из Cookies)
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get('NEXT_LOCALE')?.value;
  const currentLang = (lang || cookieLang || 'ru') as Locale;

  const dict = dictionaries[currentLang] || dictionaries.ru;

  // 1. Ищем статью по slug с присоединением категории и всех языковых полей
  const articleRows = await db
    .select({
      id: articles.id,
      title: articles.title,
      titleKk: articles.titleKk,
      titleEn: articles.titleEn,
      summary: articles.summary,
      summaryKk: articles.summaryKk,
      summaryEn: articles.summaryEn,
      content: articles.content,
      contentKk: articles.contentKk,
      contentEn: articles.contentEn,
      imageUrl: articles.imageUrl,
      viewsCount: articles.viewsCount,
      publishedAt: articles.publishedAt,
      categoryId: articles.categoryId,
      categoryName: categories.name,
      categoryNameKk: categories.nameKk,
      categoryNameEn: categories.nameEn,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.slug, slug))
    .limit(1);

  const article = articleRows[0];

  if (!article) {
    notFound();
  }

  // Локализованные значения
  const title = getLocalizedField(article, 'title', currentLang);
  const summary = getLocalizedField(article, 'summary', currentLang);
  const content = getLocalizedField(article, 'content', currentLang);
  const categoryName = getLocalizedField(
    { name: article.categoryName, nameKk: article.categoryNameKk, nameEn: article.categoryNameEn },
    'name',
    currentLang
  );

  // 2. Инкрементируем счётчик просмотров
  await db
    .update(articles)
    .set({ viewsCount: sql`${articles.viewsCount} + 1` })
    .where(eq(articles.id, article.id));

  // 3. Загружаем категории для шапки
  const allCategories = await db.select().from(categories);

  // 4. Загружаем комментарии к новости (включая parentId)
  const rawComments = await db
    .select({
      id: comments.id,
      text: comments.text,
      createdAt: comments.createdAt,
      parentId: comments.parentId,
      userName: users.name,
      userEmail: users.email,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.articleId, article.id))
    .orderBy(desc(comments.createdAt));

  // Построение древовидной структуры комментариев (Родитель -> Вложенные ответы)
  const commentMap = new Map<string, CommentType>();
  const rootComments: CommentType[] = [];

  rawComments.forEach((c) => {
    commentMap.set(c.id, {
      id: c.id,
      text: c.text,
      createdAt: c.createdAt,
      userName: c.userName || c.userEmail || 'Пользователь',
      parentId: c.parentId,
      replies: [],
    });
  });

  rawComments.forEach((c) => {
    const item = commentMap.get(c.id)!;
    if (c.parentId && commentMap.has(c.parentId)) {
      commentMap.get(c.parentId)!.replies!.unshift(item);
    } else {
      rootComments.push(item);
    }
  });

  // 5. Похожие новости из той же категории
  const relatedArticles = await db
    .select({
      id: articles.id,
      title: articles.title,
      titleKk: articles.titleKk,
      titleEn: articles.titleEn,
      slug: articles.slug,
      imageUrl: articles.imageUrl,
      viewsCount: articles.viewsCount,
      publishedAt: articles.publishedAt,
      categoryName: categories.name,
      categoryNameKk: categories.nameKk,
      categoryNameEn: categories.nameEn,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(
      article.categoryId
        ? and(eq(articles.categoryId, article.categoryId), ne(articles.id, article.id))
        : ne(articles.id, article.id)
    )
    .orderBy(desc(articles.publishedAt))
    .limit(3);

  const isAdmin = session?.role === 'ADMIN' || session?.role === 'EDITOR';

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans">
      {/* 🟢 ШАПКА / HEADER */}
      <header className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <Link href={`/?lang=${currentLang}`} className="flex items-center space-x-3 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Aqparat.com.kz"
                width={160}
                height={40}
                className="h-9 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          <nav className="hidden md:flex space-x-6 font-medium text-sm overflow-x-auto">
            <Link href={`/?lang=${currentLang}`} className="text-gray-600 hover:text-[#0096b1] transition">
              {dict.all}
            </Link>
            {allCategories.map((c) => {
              const catName = getLocalizedField(c, 'name', currentLang);
              return (
                <Link
                  key={c.id}
                  href={`/?cat=${c.id}&lang=${currentLang}`}
                  className={`transition whitespace-nowrap ${
                    article.categoryId === c.id
                      ? 'text-[#0096b1] font-bold border-b-2 border-[#0096b1] pb-1'
                      : 'text-gray-600 hover:text-[#0096b1]'
                  }`}
                >
                  {catName}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            <form method="GET" action="/" className="relative hidden sm:block">
              <input type="hidden" name="lang" value={currentLang} />
              <input
                type="text"
                name="q"
                placeholder={dict.searchPlaceholder}
                className="w-48 lg:w-64 pl-9 pr-3 py-1.5 bg-gray-100 border border-transparent rounded-full text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-[#0096b1]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
            </form>

            <LanguageSwitcher currentLang={currentLang} />

            <Link href="/login" className="p-2 hover:bg-gray-100 rounded-full">
              <User className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
        </div>
      </header>

      {/* 📰 ОСНОВНОЙ КОНТЕНТ СТАТЬИ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href={`/?lang=${currentLang}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#0096b1] mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> {dict.all}
        </Link>

        <article className="space-y-6">
          {/* Метаданные новости */}
          <div className="flex items-center gap-3 text-xs">
            <span className="bg-cyan-50 text-[#0096b1] border border-[#0096b1]/20 font-bold px-3 py-1 rounded-full uppercase">
              {categoryName || 'Новость'}
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(article.publishedAt).toLocaleDateString(
                currentLang === 'kk' ? 'kk-KZ' : currentLang === 'en' ? 'en-US' : 'ru-RU',
                {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }
              )}
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              <Eye className="w-3.5 h-3.5" /> {article.viewsCount + 1}
            </span>
          </div>

          {/* Заголовок статьи */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            {title}
          </h1>

          {/* Краткое описание (Summary) */}
          {summary && (
            <p className="text-lg font-medium text-gray-600 border-l-4 border-[#0096b1] pl-4 py-1 italic bg-gray-50 rounded-r-xl">
              {summary}
            </p>
          )}

          {/* Обложка статьи */}
          {article.imageUrl && (
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 my-6 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.imageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Полное содержание статьи */}
          <div className="text-gray-800 text-base md:text-lg leading-relaxed whitespace-pre-line font-normal space-y-4 pt-2">
            {content}
          </div>

          {/* 🔗 КНОПКИ "ПОДЕЛИТЬСЯ" */}
          <ShareButtons title={title} />
        </article>

        {/* 💬 СЕКЦИЯ КОММЕНТАРИЕВ */}
        <section className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-[#0096b1]" />
            <h3 className="text-xl font-bold text-gray-900">
              {dict.comments} ({rawComments.length})
            </h3>
          </div>

          {/* Блок отправки базового комментария */}
          {session ? (
            <CommentForm articleId={article.id} />
          ) : (
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-[#0096b1]/20 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-gray-900 text-base">{dict.wantComment}</h4>
                <p className="text-xs text-gray-600 mt-1">{dict.loginPrompt}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 bg-[#0096b1] hover:bg-[#007b92] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm"
                >
                  <LogIn className="w-4 h-4" /> {dict.login}
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs px-4 py-2.5 rounded-xl transition border border-gray-300"
                >
                  {dict.register}
                </Link>
              </div>
            </div>
          )}

          {/* Древовидный список комментариев с постраничной подгрузкой */}
          {rootComments.length > 0 ? (
            <CommentListWrapper
              rootComments={rootComments}
              articleId={article.id}
              isAdmin={isAdmin}
              isAuthenticated={Boolean(session)}
            />
          ) : (
            <p className="text-sm text-gray-500 italic text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              {dict.noComments}
            </p>
          )}
        </section>

        {/* ПОХОЖИЕ НОВОСТИ */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">{dict.readAlso}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((item) => {
                const relTitle = getLocalizedField(item, 'title', currentLang);
                const relCat = getLocalizedField(
                  { name: item.categoryName, nameKk: item.categoryNameKk, nameEn: item.categoryNameEn },
                  'name',
                  currentLang
                );

                return (
                  <Link
                    key={item.id}
                    href={`/news/${item.slug}?lang=${currentLang}`}
                    className="group block bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
                  >
                    {item.imageUrl && (
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={relTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                    )}
                    <span className="text-[10px] font-bold text-[#0096b1] uppercase">
                      {relCat}
                    </span>
                    <h4 className="font-bold text-sm leading-snug mt-1 group-hover:text-[#0096b1] transition line-clamp-2">
                      {relTitle}
                    </h4>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
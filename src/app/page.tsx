import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/src/db';
import { articles, categories } from '@/src/db/schema';
import { eq, desc, ilike, and, count, or } from 'drizzle-orm';
import { Eye, Search, User, ChevronLeft, ChevronRight, Filter, Calendar } from 'lucide-react';
import { cookies } from 'next/headers';
import LanguageSwitcher from '@/src/components/LanguageSwitcher';
import { dictionaries, getLocalizedField, Locale } from '@/src/lib/i18n';

export const revalidate = 0; // Всегда свежие данные

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    cat?: string;
    page?: string;
    lang?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q, cat, page, lang } = await searchParams;

  // 1. Определение локали (из URL или из Cookies)
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get('NEXT_LOCALE')?.value;
  const currentLang = (lang || cookieLang || 'ru') as Locale;

  const dict = dictionaries[currentLang] || dictionaries.ru;

  const searchQuery = q?.trim() || '';
  const selectedCategory = cat?.trim() || '';
  const currentPage = Math.max(1, Number(page) || 1);
  const PAGE_SIZE = 6; // Количество новостей в основной сетке на страницу

  // Загружаем все категории для фильтров в шапке
  const allCategories = await db.select().from(categories);

  // 2. Условия фильтрации для основного списка
  const conditions = [];
  if (searchQuery) {
    conditions.push(
      or(
        ilike(articles.title, `%${searchQuery}%`),
        ilike(articles.titleKk, `%${searchQuery}%`),
        ilike(articles.titleEn, `%${searchQuery}%`)
      )
    );
  }
  if (selectedCategory) {
    conditions.push(eq(articles.categoryId, selectedCategory));
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  // 3. Получаем общее количество новостей для пагинации
  const totalCountResult = await db
    .select({ count: count() })
    .from(articles)
    .where(whereCondition);

  const totalArticles = totalCountResult[0]?.count || 0;
  const totalPages = Math.ceil(totalArticles / PAGE_SIZE) || 1;
  const offset = (currentPage - 1) * PAGE_SIZE;

  // 4. Запрос главной новости (Hero) — только если нет активного поиска
  let heroArticle = null;
  if (!searchQuery && !selectedCategory && currentPage === 1) {
    const heroRows = await db
      .select({
        id: articles.id,
        title: articles.title,
        titleKk: articles.titleKk,
        titleEn: articles.titleEn,
        summary: articles.summary,
        summaryKk: articles.summaryKk,
        summaryEn: articles.summaryEn,
        slug: articles.slug,
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
      .where(eq(articles.isHero, true))
      .limit(1);

    heroArticle = heroRows[0] || null;
  }

  // 5. Основной список новостей с учетом пагинации и фильтрации
  const mainArticles = await db
    .select({
      id: articles.id,
      title: articles.title,
      titleKk: articles.titleKk,
      titleEn: articles.titleEn,
      summary: articles.summary,
      summaryKk: articles.summaryKk,
      summaryEn: articles.summaryEn,
      slug: articles.slug,
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
    .where(
      heroArticle
        ? and(whereCondition, eq(articles.isHero, false))
        : whereCondition
    )
    .orderBy(desc(articles.publishedAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  // 6. Последние популярные новости для правой колонки
  const latestArticles = await db
    .select({
      id: articles.id,
      title: articles.title,
      titleKk: articles.titleKk,
      titleEn: articles.titleEn,
      slug: articles.slug,
      viewsCount: articles.viewsCount,
      publishedAt: articles.publishedAt,
      categoryName: categories.name,
      categoryNameKk: categories.nameKk,
      categoryNameEn: categories.nameEn,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .orderBy(desc(articles.publishedAt))
    .limit(5);

  const selectedCategoryObj = allCategories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 text-neutral-900 font-sans">
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

          {/* НАВИГАЦИЯ ПО КАТЕГОРИЯМ (ФИЛЬТРЫ) */}
          <nav className="hidden md:flex space-x-6 font-medium text-sm overflow-x-auto">
            <Link
              href={`/?lang=${currentLang}`}
              className={`transition whitespace-nowrap ${
                !selectedCategory
                  ? 'text-[#0096b1] font-bold border-b-2 border-[#0096b1] pb-1'
                  : 'text-gray-600 hover:text-[#0096b1]'
              }`}
            >
              {dict.all}
            </Link>
            {allCategories.map((c) => {
              const categoryName = getLocalizedField(c, 'name', currentLang);
              return (
                <Link
                  key={c.id}
                  href={`/?cat=${c.id}&lang=${currentLang}`}
                  className={`transition whitespace-nowrap ${
                    selectedCategory === c.id
                      ? 'text-[#0096b1] font-bold border-b-2 border-[#0096b1] pb-1'
                      : 'text-gray-600 hover:text-[#0096b1]'
                  }`}
                >
                  {categoryName}
                </Link>
              );
            })}
          </nav>

          {/* ПОИСК + ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА В ШАПКЕ */}
          <div className="flex items-center space-x-3">
            <form method="GET" action="/" className="relative hidden sm:block">
              <input type="hidden" name="lang" value={currentLang} />
              {selectedCategory && <input type="hidden" name="cat" value={selectedCategory} />}
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder={dict.searchPlaceholder}
                className="w-48 lg:w-64 pl-9 pr-3 py-1.5 bg-gray-100 border border-transparent rounded-full text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-[#0096b1]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
            </form>

            {/* Выпадающий список языков */}
            <LanguageSwitcher currentLang={currentLang} />

            <Link href="/login" className="p-2 hover:bg-gray-100 rounded-full transition">
              <User className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
        </div>
      </header>

      {/* 📰 ОСНОВНОЙ КОНТЕНТ */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Индикатор активного фильтра/поиска */}
        {(searchQuery || selectedCategory) && (
          <div className="mb-6 p-4 bg-cyan-50 border border-[#0096b1]/20 rounded-2xl flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-800">
              <Filter className="w-4 h-4 text-[#0096b1]" />
              <span>
                Результаты {searchQuery && <strong>по запросу «{searchQuery}»</strong>}
                {selectedCategory && (
                  <span>
                    {' '}в категории <strong>{selectedCategoryObj ? getLocalizedField(selectedCategoryObj, 'name', currentLang) : ''}</strong>
                  </span>
                )}
                {' '}(найдено: {totalArticles})
              </span>
            </div>
            <Link href={`/?lang=${currentLang}`} className="text-xs font-bold text-[#0096b1] hover:underline">
              Сбросить фильтры
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* СЛЕВА: Hero-новость и сетка карточек (8 колонок) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* HERO ПОСТ (отображается только на 1 странице без поисковых фильтров) */}
            {heroArticle && (
              <Link href={`/news/${heroArticle.slug}`} className="group block relative rounded-2xl overflow-hidden aspect-[16/9] bg-gray-900">
                {heroArticle.imageUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={heroArticle.imageUrl}
                    alt={getLocalizedField(heroArticle, 'title', currentLang)}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
                  <span className="text-xs bg-[#0096b1] text-white font-bold px-2.5 py-1 rounded-md w-fit mb-2 uppercase">
                    {getLocalizedField(
                      { name: heroArticle.categoryName, nameKk: heroArticle.categoryNameKk, nameEn: heroArticle.categoryNameEn },
                      'name',
                      currentLang
                    ) || dict.heroTag}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3 group-hover:text-[#0096b1] transition">
                    {getLocalizedField(heroArticle, 'title', currentLang)}
                  </h1>
                  <div className="flex items-center text-xs text-gray-300 space-x-4">
                    <span>
                      {new Date(heroArticle.publishedAt).toLocaleDateString(
                        currentLang === 'kk' ? 'kk-KZ' : currentLang === 'en' ? 'en-US' : 'ru-RU'
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> {heroArticle.viewsCount}
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* СЕТКА НОВОСТЕЙ */}
            {mainArticles.length === 0 ? (
              <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-200">
                По вашему запросу ничего не найдено.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mainArticles.map((article) => {
                  const title = getLocalizedField(article, 'title', currentLang);
                  const categoryName = getLocalizedField(
                    { name: article.categoryName, nameKk: article.categoryNameKk, nameEn: article.categoryNameEn },
                    'name',
                    currentLang
                  );

                  return (
                    <Link
                      key={article.id}
                      href={`/news/${article.slug}`}
                      className="group flex flex-col justify-between bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
                    >
                      <div>
                        {article.imageUrl && (
                          <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={article.imageUrl}
                              alt={title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-[#0096b1] uppercase tracking-wider">
                          {categoryName}
                        </span>
                        <h2 className="font-bold text-base leading-snug mt-1 group-hover:text-[#0096b1] transition line-clamp-3">
                          {title}
                        </h2>
                      </div>
                      <div className="flex items-center text-xs text-gray-400 mt-4 space-x-3 border-t border-gray-100 pt-3">
                        <span>
                          {new Date(article.publishedAt).toLocaleDateString(
                            currentLang === 'kk' ? 'kk-KZ' : currentLang === 'en' ? 'en-US' : 'ru-RU'
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> {article.viewsCount}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* ПАГИНАЦИЯ */}
            {totalPages > 1 && (
              <div className="pt-6 flex items-center justify-between text-sm text-gray-600">
                <span>
                  Страница <strong>{currentPage}</strong> из <strong>{totalPages}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/?${new URLSearchParams({
                      ...(searchQuery && { q: searchQuery }),
                      ...(selectedCategory && { cat: selectedCategory }),
                      lang: currentLang,
                      page: String(currentPage - 1),
                    }).toString()}`}
                    className={`px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center gap-1 font-semibold ${
                      currentPage <= 1 ? 'pointer-events-none opacity-40' : ''
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" /> Назад
                  </Link>

                  <Link
                    href={`/?${new URLSearchParams({
                      ...(searchQuery && { q: searchQuery }),
                      ...(selectedCategory && { cat: selectedCategory }),
                      lang: currentLang,
                      page: String(currentPage + 1),
                    }).toString()}`}
                    className={`px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center gap-1 font-semibold ${
                      currentPage >= totalPages ? 'pointer-events-none opacity-40' : ''
                    }`}
                  >
                    Вперед <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* СПРАВА: Баннер + Список последних новостей (4 колонки) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* РЕКЛАМНЫЙ БАННЕР */}
            <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm flex items-center gap-4">
              <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=300"
                  alt="Changan EADO Plus"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm leading-tight">Новый Changan EADO Plus</h3>
                <p className="text-xs text-gray-500 mt-0.5">за 7 190 000 тенге</p>
                <span className="text-[10px] text-blue-600 font-semibold uppercase mt-1 inline-block">Реклама</span>
              </div>
            </div>

            {/* СПИСОК «ПОСЛЕДНИЕ» НОВОСТИ */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="flex border-b border-gray-100 mb-4 pb-2">
                <button className="font-bold text-sm text-[#0096b1] border-b-2 border-[#0096b1] pb-2 -mb-2.5">
                  {dict.latestNews}
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {latestArticles.map((item) => {
                  const sideTitle = getLocalizedField(item, 'title', currentLang);
                  const sideCat = getLocalizedField(
                    { name: item.categoryName, nameKk: item.categoryNameKk, nameEn: item.categoryNameEn },
                    'name',
                    currentLang
                  );

                  return (
                    <Link key={item.id} href={`/news/${item.slug}`} className="py-3 block group">
                      <h4 className="text-sm font-semibold group-hover:text-[#0096b1] transition leading-snug line-clamp-2">
                        {sideTitle}
                      </h4>
                      <div className="flex items-center text-xs text-gray-400 space-x-3 mt-2">
                        <span className="text-[#0096b1] font-medium">{sideCat}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> {item.viewsCount}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
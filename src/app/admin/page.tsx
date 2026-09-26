import { getSession, logout } from '@/src/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/src/db';
import { articles, categories } from '@/src/db/schema';
import { desc, eq, ilike, count } from 'drizzle-orm';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  LogOut,
  Eye,
  ShieldCheck,
  Newspaper,
  UserPlus,
  Globe,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import ArticleActions from './ArticleActions';

interface AdminDashboardProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardProps) {
  const session = await getSession();

  if (!session || (session.role !== 'ADMIN' && session.role !== 'EDITOR')) {
    redirect('/login');
  }

  // Получаем параметры из URL
  const { q, page } = await searchParams;
  const searchQuery = q?.trim() || '';
  const currentPage = Math.max(1, Number(page) || 1);
  const PAGE_SIZE = 5; // Количество статей на страницу

  // Условие поиска по заголовку
  const whereCondition = searchQuery ? ilike(articles.title, `%${searchQuery}%`) : undefined;

  // 1. Получаем общее количество статей под текущий запрос
  const totalCountResult = await db
    .select({ count: count() })
    .from(articles)
    .where(whereCondition);

  const totalArticles = totalCountResult[0]?.count || 0;
  const totalPages = Math.ceil(totalArticles / PAGE_SIZE) || 1;
  const offset = (currentPage - 1) * PAGE_SIZE;

  // 2. Получаем список статей с постраничной навигацией
  const allArticles = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      isHero: articles.isHero,
      viewsCount: articles.viewsCount,
      publishedAt: articles.publishedAt,
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(whereCondition)
    .orderBy(desc(articles.publishedAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Верхняя панель */}
      <header className="bg-black text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/" target="_blank" className="flex items-center gap-2 hover:opacity-80 transition">
            <Image
              src="/logo.png"
              alt="Aqparat.com.kz"
              width={140}
              height={35}
              className="h-8 w-auto object-contain brightness-0 invert"
            />
            <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded ml-1 font-bold">ADMIN</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4 text-xs">
        <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700 font-medium transition"
        >
            <Globe className="w-3.5 h-3.5 text-[#0096b1]" /> Перейти на сайт
        </Link>

        {/* Ссылка на личный профиль */}
        <Link
            href="/admin/profile"
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700 font-medium transition"
        >
            <ShieldCheck className="w-4 h-4 text-[#0096b1]" />
            {session.email} ({session.role})
        </Link>

        <form action={async () => {
            'use server';
            await logout();
            redirect('/login');
        }}>
            <button type="submit" className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-medium transition">
            <LogOut className="w-3.5 h-3.5" /> Выход
            </button>
        </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-[#0096b1]" /> Управление статьями
          </h1>

          <div className="flex items-center gap-3">
            {session.role === 'ADMIN' && (
              <Link
                href="/admin/users"
                className="bg-black hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm transition"
              >
                <UserPlus className="w-4 h-4 text-[#0096b1]" /> Сотрудники
              </Link>
            )}

            <Link
              href="/admin/articles/create"
              className="bg-[#0096b1] hover:bg-[#007b92] text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition"
            >
              <Plus className="w-4 h-4" /> Создать новость
            </Link>
          </div>
        </div>

        {/* Панель поиска */}
        <div className="mb-6">
          <form method="GET" action="/admin" className="relative max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Поиск статей по заголовку..."
              className="w-full pl-10 pr-24 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0096b1] shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bg-[#0096b1] hover:bg-[#007b92] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              Найти
            </button>
          </form>
        </div>

        {/* Таблица новостей */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-[11px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Заголовок</th>
                <th className="px-6 py-3">Категория</th>
                <th className="px-6 py-3">Тип</th>
                <th className="px-6 py-3">Просмотры</th>
                <th className="px-6 py-3">Дата</th>
                <th className="px-6 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {allArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-sm">
                    {searchQuery ? 'Статьи по вашему запросу не найдены' : 'Список статей пуст'}
                  </td>
                </tr>
              ) : (
                allArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900 line-clamp-1">{art.title}</td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">{art.categoryName || 'Без категории'}</td>
                    <td className="px-6 py-4">
                      {art.isHero ? (
                        <span className="bg-cyan-50 text-[#0096b1] border border-[#0096b1]/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Главная (Hero)</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-full uppercase">Стандартная</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs flex items-center gap-1 text-gray-500">
                      <Eye className="w-3.5 h-3.5" /> {art.viewsCount}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(art.publishedAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ArticleActions articleId={art.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>
                Страница <strong className="text-gray-800">{currentPage}</strong> из <strong className="text-gray-800">{totalPages}</strong> (всего статей: {totalArticles})
              </span>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin?${new URLSearchParams({
                    ...(searchQuery && { q: searchQuery }),
                    page: String(currentPage - 1),
                  }).toString()}`}
                  className={`p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition flex items-center gap-1 ${
                    currentPage <= 1 ? 'pointer-events-none opacity-40' : ''
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" /> Назад
                </Link>

                <Link
                  href={`/admin?${new URLSearchParams({
                    ...(searchQuery && { q: searchQuery }),
                    page: String(currentPage + 1),
                  }).toString()}`}
                  className={`p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition flex items-center gap-1 ${
                    currentPage >= totalPages ? 'pointer-events-none opacity-40' : ''
                  }`}
                >
                  Вперед <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
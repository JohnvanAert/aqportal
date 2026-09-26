'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bookmark,
  Trash2,
  User,
  LogOut,
  ArrowLeft,
  Loader2,
  Newspaper,
  Calendar,
  Settings,
  Lock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface SavedArticle {
  bookmarkId: string;
  savedAt: string;
  article: {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    imageUrl: string | null;
    publishedAt: string;
    categoryName: string | null;
  };
}

export default function UserProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'settings'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Данные профиля
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');
  const [avatar, setAvatar] = useState('');
  
  // Смена пароля
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUserData = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data.user) {
        setName(data.user.name || '');
        setEmail(data.user.email || '');
        setRole(data.user.role || 'USER');
        setAvatar(data.user.avatar || '');
      }
      if (data.bookmarks) {
        setBookmarks(data.bookmarks);
      }
    } catch {
      setError('Не удалось загрузить данные профиля');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка обновления профиля');
      } else {
        setSuccess('Профиль успешно обновлен!');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch {
      setError('Ошибка соединения с сервером');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveBookmark = async (articleId: string) => {
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });

      if (res.ok) {
        setBookmarks((prev) => prev.filter((b) => b.article.id !== articleId));
      }
    } catch {
      alert('Ошибка при удалении');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0096b1]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Шапка */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#0096b1] transition"
          >
            <ArrowLeft className="w-4 h-4" /> На главную
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Выйти из аккаунта
          </button>
        </div>

        {/* Карточка пользователя */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={name} className="w-16 h-16 rounded-2xl object-cover border" />
            ) : (
              <div className="w-16 h-16 bg-cyan-50 border border-[#0096b1]/20 rounded-2xl flex items-center justify-center text-[#0096b1]">
                <User className="w-8 h-8" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{name || 'Пользователь'}</h1>
                <span className="text-[10px] font-extrabold uppercase bg-cyan-50 text-[#0096b1] border border-[#0096b1]/20 px-2.5 py-0.5 rounded-full">
                  {role}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{email}</p>
            </div>
          </div>

          {/* Вкладки переключения */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'bookmarks'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Bookmark className="w-4 h-4 text-[#0096b1]" /> Закладки ({bookmarks.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'settings'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Settings className="w-4 h-4 text-[#0096b1]" /> Настройки
            </button>
          </div>
        </div>

        {/* ВКЛАДКА 1: ЗАКЛАДКИ */}
        {activeTab === 'bookmarks' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-[#0096b1]" /> Сохранённые новости
            </h2>

            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookmarks.map(({ bookmarkId, article }) => (
                  <div
                    key={bookmarkId}
                    className="bg-gray-50 rounded-2xl border border-gray-200 p-4 flex gap-4 relative group hover:border-gray-300 transition"
                  >
                    {article.imageUrl && (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 flex flex-col justify-between pr-8">
                      <div>
                        <span className="text-[10px] font-bold text-[#0096b1] uppercase">
                          {article.categoryName || 'Новость'}
                        </span>
                        <Link
                          href={`/news/${article.slug}`}
                          className="block font-bold text-sm text-gray-900 hover:text-[#0096b1] transition line-clamp-2 mt-0.5"
                        >
                          {article.title}
                        </Link>
                      </div>

                      <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.publishedAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveBookmark(article.id)}
                      title="Удалить из закладок"
                      className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Newspaper className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-600">У вас пока нет сохранённых статей</p>
                <p className="text-xs text-gray-400 mt-1">
                  Нажимайте «Сохранить» при чтении материалов, чтобы добавить их сюда
                </p>
                <Link
                  href="/"
                  className="inline-block mt-4 bg-[#0096b1] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#007b92] transition"
                >
                  Читать новости
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ВКЛАДКА 2: НАСТРОЙКИ ПРОФИЛЯ */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm max-w-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#0096b1]" /> Настройки профиля
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Имя</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:bg-white focus:border-[#0096b1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email (нельзя изменить)</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#0096b1]" /> Изменение пароля
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Текущий пароль</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:bg-white focus:border-[#0096b1]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Новый пароль</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:bg-white focus:border-[#0096b1]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0096b1] hover:bg-[#007b92] text-white font-bold py-3 rounded-xl transition shadow-md text-sm disabled:opacity-50 mt-4 cursor-pointer"
              >
                {submitting ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
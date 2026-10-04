'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, Upload, Loader2, Languages, Camera, UserCheck } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  nameKk?: string | null;
  nameEn?: string | null;
}

interface UserItem {
  id: string;
  name: string | null;
  email: string;
}

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: articleId } = use(params);

  const [categories, setCategories] = useState<Category[]>([]);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [activeTab, setActiveTab] = useState<'RU' | 'KK' | 'EN'>('RU');

  // Поля на русском языке
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [imageSource, setImageSource] = useState('');

  // Поля на казахском языке
  const [titleKk, setTitleKk] = useState('');
  const [summaryKk, setSummaryKk] = useState('');
  const [contentKk, setContentKk] = useState('');
  const [imageSourceKk, setImageSourceKk] = useState('');

  // Поля на английском языке
  const [titleEn, setTitleEn] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [imageSourceEn, setImageSourceEn] = useState('');

  // Общие свойства
  const [categoryId, setCategoryId] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isHero, setIsHero] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/categories').then((r) => r.json()),
      fetch('/api/admin/users').then((r) => r.json()).catch(() => ({ users: [] })),
      fetch(`/api/admin/articles/${articleId}`).then((r) => r.json()),
    ])
      .then(([catData, userData, artData]) => {
        if (catData.categories) setCategories(catData.categories);
        if (userData.users) setUsersList(userData.users);
        if (artData.article) {
          const art = artData.article;
          // RU
          setTitle(art.title || '');
          setSummary(art.summary || '');
          setContent(art.content || '');
          setImageSource(art.imageSource || '');
          // KK
          setTitleKk(art.titleKk || art.title_kk || '');
          setSummaryKk(art.summaryKk || art.summary_kk || '');
          setContentKk(art.contentKk || art.content_kk || '');
          setImageSourceKk(art.imageSourceKk || art.image_source_kk || '');
          // EN
          setTitleEn(art.titleEn || art.title_en || '');
          setSummaryEn(art.summaryEn || art.summary_en || '');
          setContentEn(art.contentEn || art.content_en || '');
          setImageSourceEn(art.imageSourceEn || art.image_source_en || '');
          // Общие
          setCategoryId(art.categoryId || '');
          setAuthorId(art.authorId || '');
          setImageUrl(art.imageUrl || '');
          setIsHero(art.isHero || false);
        }
      })
      .catch(() => setError('Не удалось загрузить данные статьи'))
      .finally(() => setLoading(false));
  }, [articleId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Файл превышает лимит 2 МБ!');
      return;
    }

    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка загрузки');
      } else {
        setImageUrl(data.url);
      }
    } catch {
      setError('Ошибка соединения при загрузке картинки');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !summary.trim() || !content.trim()) {
      setError('Заполните все обязательные поля на русском языке!');
      setActiveTab('RU');
      return;
    }

    if (!titleKk.trim() || !summaryKk.trim() || !contentKk.trim()) {
      setError('Заполните все обязательные поля на казахском языке!');
      setActiveTab('KK');
      return;
    }

    if (!titleEn.trim() || !summaryEn.trim() || !contentEn.trim()) {
      setError('Заполните все обязательные поля на английском языке!');
      setActiveTab('EN');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim(),
          content: content.trim(),
          imageSource: imageSource.trim() || null,

          titleKk: titleKk.trim(),
          summaryKk: summaryKk.trim(),
          contentKk: contentKk.trim(),
          imageSourceKk: imageSourceKk.trim() || null,

          titleEn: titleEn.trim(),
          summaryEn: summaryEn.trim(),
          contentEn: contentEn.trim(),
          imageSourceEn: imageSourceEn.trim() || null,

          categoryId,
          authorId: authorId || null,
          imageUrl: imageUrl || null,
          isHero,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка обновления статьи');
      } else {
        setSuccess('Изменения успешно сохранены на всех 3 языках!');
        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 1000);
      }
    } catch {
      setError('Ошибка соединения с сервером');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0096b1]" />
      </div>
    );
  }

  const isRuComplete = Boolean(title.trim() && summary.trim() && content.trim());
  const isKkComplete = Boolean(titleKk.trim() && summaryKk.trim() && contentKk.trim());
  const isEnComplete = Boolean(titleEn.trim() && summaryEn.trim() && contentEn.trim());

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Назад в панель управления
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Редактирование новости</h1>

            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('RU')}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'RU'
                    ? 'bg-[#0096b1] text-white shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Русский <span className="text-red-400">*</span>
                {isRuComplete && <span className="text-green-300 ml-1">✓</span>}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('KK')}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'KK'
                    ? 'bg-[#0096b1] text-white shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Қазақша <span className="text-red-400">*</span>
                {isKkComplete && <span className="text-green-300 ml-1">✓</span>}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('EN')}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold transition ${
                  activeTab === 'EN'
                    ? 'bg-[#0096b1] text-white shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                English <span className="text-red-400">*</span>
                {isEnComplete && <span className="text-green-300 ml-1">✓</span>}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Общие свойства: Категория, Автор, Обложка */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Категория <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-[#0096b1]" /> Автор статьи
                </label>
                <select
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                >
                  <option value="">Не указан</option>
                  {usersList.map((usr) => (
                    <option key={usr.id} value={usr.id}>
                      {usr.name || usr.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Обложка (до 2 МБ)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-semibold px-4 py-3 rounded-xl text-xs transition border border-gray-300">
                    <Upload className="w-4 h-4 text-[#0096b1]" />
                    {uploading ? 'Загрузка...' : 'Выбрать'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {imageUrl && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Превью" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ВКЛАДКА: РУССКИЙ ЯЗЫК */}
            {activeTab === 'RU' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-cyan-50 border border-[#0096b1]/20 px-4 py-2.5 rounded-xl">
                  <span className="text-xs font-bold text-[#0096b1] flex items-center gap-1.5">
                    <Languages className="w-4 h-4" /> Контент на русском языке
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Заголовок статьи (RU) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Введите заголовок..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#0096b1]" /> Источник фотографии (RU)
                  </label>
                  <input
                    type="text"
                    value={imageSource}
                    onChange={(e) => setImageSource(e.target.value)}
                    placeholder="Например: Пресс-служба / Pixabay"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Краткое описание (Summary RU) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Краткое содержание..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Полный текст статьи (RU) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Текст новости..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                  />
                </div>
              </div>
            )}

            {/* ВКЛАДКА: КАЗАХСКИЙ ЯЗЫК */}
            {activeTab === 'KK' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-cyan-50 border border-[#0096b1]/20 px-4 py-2.5 rounded-xl">
                  <span className="text-xs font-bold text-[#0096b1] flex items-center gap-1.5">
                    <Languages className="w-4 h-4" /> Қазақ тіліндегі мазмұны
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Мақаланың тақырыбы (KK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={titleKk}
                    onChange={(e) => setTitleKk(e.target.value)}
                    placeholder="Тақырып..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#0096b1]" /> Фото көзі (KK)
                  </label>
                  <input
                    type="text"
                    value={imageSourceKk}
                    onChange={(e) => setImageSourceKk(e.target.value)}
                    placeholder="Мысалы: Әкімдіктің баспасөз қызметі"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Қысқаша сипаттамасы (Summary KK) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={summaryKk}
                    onChange={(e) => setSummaryKk(e.target.value)}
                    placeholder="Қысқаша мазмұны..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Мақаланың толық мәтіні (KK) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={contentKk}
                    onChange={(e) => setContentKk(e.target.value)}
                    placeholder="Толық мәтіні..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                  />
                </div>
              </div>
            )}

            {/* ВКЛАДКА: АНГЛИЙСКИЙ ЯЗЫК */}
            {activeTab === 'EN' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-cyan-50 border border-[#0096b1]/20 px-4 py-2.5 rounded-xl">
                  <span className="text-xs font-bold text-[#0096b1] flex items-center gap-1.5">
                    <Languages className="w-4 h-4" /> Content in English
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Article Title (EN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="Article title..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#0096b1]" /> Photo Source (EN)
                  </label>
                  <input
                    type="text"
                    value={imageSourceEn}
                    onChange={(e) => setImageSourceEn(e.target.value)}
                    placeholder="For example: Press Service"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Summary (EN) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={summaryEn}
                    onChange={(e) => setSummaryEn(e.target.value)}
                    placeholder="Short summary..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Full Article Content (EN) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={contentEn}
                    onChange={(e) => setContentEn(e.target.value)}
                    placeholder="Full content..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                id="isHero"
                checked={isHero}
                onChange={(e) => setIsHero(e.target.checked)}
                className="w-5 h-5 text-[#0096b1] rounded focus:ring-0 cursor-pointer"
              />
              <label htmlFor="isHero" className="text-sm font-semibold text-gray-800 cursor-pointer">
                Сделать главной новостью на главной странице (Hero)
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#0096b1] hover:bg-[#007b92] text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md text-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Сохранение...' : 'Сохранить изменения (RU / KK / EN)'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
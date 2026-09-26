'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, Upload, Languages } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  nameKk?: string | null;
  nameEn?: string | null;
}

export default function CreateArticlePage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'RU' | 'KK' | 'EN'>('RU');

  // Поля на русском языке
  const [titleRu, setTitleRu] = useState('');
  const [summaryRu, setSummaryRu] = useState('');
  const [contentRu, setContentRu] = useState('');

  // Поля на казахском языке
  const [titleKk, setTitleKk] = useState('');
  const [summaryKk, setSummaryKk] = useState('');
  const [contentKk, setContentKk] = useState('');

  // Поля на английском языке
  const [titleEn, setTitleEn] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [contentEn, setContentEn] = useState('');

  // Общие параметры статьи
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isHero, setIsHero] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setCategoryId(data.categories[0].id);
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Размер файла превышает допустимый лимит 2 МБ!');
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
        setError(data.error || 'Ошибка загрузки файла');
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

    // 🛑 Строгая проверка обязательности ВСЕХ языковых полей
    if (!titleRu.trim() || !summaryRu.trim() || !contentRu.trim()) {
      setError('Заполните все поля на русском языке (Заголовок, Краткое описание, Текст)!');
      setActiveTab('RU');
      return;
    }

    if (!titleKk.trim() || !summaryKk.trim() || !contentKk.trim()) {
      setError('Заполните все поля на казахском языке (Қазақша)!');
      setActiveTab('KK');
      return;
    }

    if (!titleEn.trim() || !summaryEn.trim() || !contentEn.trim()) {
      setError('Заполните все поля на английском языке (English)!');
      setActiveTab('EN');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleRu.trim(),
          summary: summaryRu.trim(),
          content: contentRu.trim(),

          titleKk: titleKk.trim(),
          summaryKk: summaryKk.trim(),
          contentKk: contentKk.trim(),

          titleEn: titleEn.trim(),
          summaryEn: summaryEn.trim(),
          contentEn: contentEn.trim(),

          categoryId,
          imageUrl: imageUrl || null,
          isHero,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка при сохранении новости');
      } else {
        setSuccess('Новость успешно опубликована на 3 языках!');
        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 1200);
      }
    } catch {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Добавление новости (RU / KK / EN)</h1>

            {/* Вкладки выбора языка (все со звёздочкой *) */}
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
                {titleRu && summaryRu && contentRu && <span className="text-green-300 ml-1">✓</span>}
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
                {titleKk && summaryKk && contentKk && <span className="text-green-300 ml-1">✓</span>}
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
                {titleEn && summaryEn && contentEn && <span className="text-green-300 ml-1">✓</span>}
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
            
            {/* ОБЩИЕ ПАРАМЕТРЫ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Категория <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                >
                  {categories.map((cat) => {
                    const categoryName =
                      activeTab === 'KK'
                        ? cat.nameKk || cat.name
                        : activeTab === 'EN'
                        ? cat.nameEn || cat.name
                        : cat.name;

                    return (
                      <option key={cat.id} value={cat.id}>
                        {categoryName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Обложка (до 2 МБ)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-semibold px-4 py-3 rounded-xl text-xs transition border border-gray-300">
                    <Upload className="w-4 h-4 text-[#0096b1]" />
                    {uploading ? 'Загрузка...' : 'Выбрать файл'}
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
                    <Languages className="w-4 h-4" /> Заполнение контента на русском языке
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Заголовок статьи (RU) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={titleRu}
                    onChange={(e) => setTitleRu(e.target.value)}
                    placeholder="Введите заголовок..."
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
                    value={summaryRu}
                    onChange={(e) => setSummaryRu(e.target.value)}
                    placeholder="Краткое содержание статьи для карточки..."
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
                    value={contentRu}
                    onChange={(e) => setContentRu(e.target.value)}
                    placeholder="Введите полный текст новости..."
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
                    <Languages className="w-4 h-4" /> Мақаланы қазақ тілінде толтыру
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
                    placeholder="Жаңалықтың тақырыбы..."
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
                    placeholder="Карточкаға арналған қысқаша мазмұны..."
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
                    placeholder="Жаңалықтың толық мәтінін енгізіңіз..."
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
                    <Languages className="w-4 h-4" /> Filling content in English
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
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Summary (EN) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={summaryEn}
                    onChange={(e) => setSummaryEn(e.target.value)}
                    placeholder="Short description for article card..."
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
                    placeholder="Enter full news content in English..."
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
              disabled={loading}
              className="w-full bg-[#0096b1] hover:bg-[#007b92] text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md text-sm disabled:opacity-50"
            >
              {loading ? 'Публикация...' : 'Опубликовать новость (RU / KK / EN)'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
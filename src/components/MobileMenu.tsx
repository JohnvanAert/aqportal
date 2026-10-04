'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search, Info, Users, PhoneCall } from 'lucide-react';
import LanguageSwitcher from '@/src/components/LanguageSwitcher';
import { Locale, dictionaries, getLocalizedField } from '@/src/lib/i18n';

interface Category {
  id: string;
  name: string;
  nameKk: string | null;
  nameEn: string | null;
}

interface MobileMenuProps {
  categories: Category[];
  currentLang: Locale;
  selectedCategory: string;
  searchQuery: string;
}

export default function MobileMenu({
  categories,
  currentLang,
  selectedCategory,
  searchQuery,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dict = dictionaries[currentLang] || dictionaries.ru;

  return (
    <div className="flex items-center">
      {/* Кнопка бургера */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer flex items-center gap-2"
        aria-label="Открыть меню"
      >
        <Menu className="w-6 h-6 text-neutral-900" />
      </button>

      {/* Полноэкранное модальное меню */}
      {isOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex justify-start">
          <div className="w-[85%] max-w-sm bg-white h-[100dvh] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            
            {/* Верхняя часть меню */}
            <div className="p-6 pb-2">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <span className="font-bold text-base text-gray-900">
                  {currentLang === 'kk' ? 'Навигация' : currentLang === 'en' ? 'Navigation' : 'Навигация'}
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Поиск в меню */}
              <div className="py-4 border-b border-gray-100">
                <form method="GET" action="/" className="relative">
                  <input type="hidden" name="lang" value={currentLang} />
                  {selectedCategory && <input type="hidden" name="cat" value={selectedCategory} />}
                  <input
                    type="text"
                    name="q"
                    defaultValue={searchQuery}
                    placeholder={dict.searchPlaceholder}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-100 border border-transparent rounded-xl text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-[#0096b1]"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                </form>
              </div>

              {/* Раздел: Информация о проекте и редакции */}
              <div className="py-4 border-b border-gray-100 space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {currentLang === 'kk' ? 'Портал туралы' : currentLang === 'en' ? 'About portal' : 'О портале'}
                </p>
                <Link
                  href={`/page/about?lang=${currentLang}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <Info className="w-4 h-4 text-[#0096b1]" /> 
                  {currentLang === 'kk' ? 'Жоба туралы' : currentLang === 'en' ? 'About project' : 'О проекте'}
                </Link>
                <Link
                  href={`/page/team?lang=${currentLang}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <Users className="w-4 h-4 text-[#0096b1]" /> 
                  {currentLang === 'kk' ? 'Редакция' : currentLang === 'en' ? 'Newsroom' : 'Редакция'}
                </Link>
                <Link
                  href={`/page/contacts?lang=${currentLang}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <PhoneCall className="w-4 h-4 text-[#0096b1]" /> 
                  {currentLang === 'kk' ? 'Байланыс' : currentLang === 'en' ? 'Contacts' : 'Контакты'}
                </Link>
              </div>

              {/* Список категорий с корректным переводом */}
              <div className="py-4 space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {currentLang === 'kk' ? 'Санаттар' : currentLang === 'en' ? 'Categories' : 'Категории'}
                </p>
                <Link
                  href={`/?lang=${currentLang}`}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    !selectedCategory
                      ? 'bg-cyan-50 text-[#0096b1]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {dict.all}
                </Link>
                {categories.map((c) => {
                  const categoryName = getLocalizedField(c, 'name', currentLang);
                  return (
                    <Link
                      key={c.id}
                      href={`/?cat=${c.id}&lang=${currentLang}`}
                      onClick={() => setIsOpen(false)}
                      className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                        selectedCategory === c.id
                          ? 'bg-cyan-50 text-[#0096b1]'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {categoryName}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Нижняя часть: Переключатель языка */}
            <div className="p-6 pt-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <span className="text-xs text-gray-500 font-medium">
                {currentLang === 'kk' ? 'Тіл:' : currentLang === 'en' ? 'Language:' : 'Язык:'}
              </span>
              <LanguageSwitcher currentLang={currentLang} />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
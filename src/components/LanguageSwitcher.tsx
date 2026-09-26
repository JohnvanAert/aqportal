'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'ru', label: 'RU', fullLabel: 'Русский' },
    { code: 'kk', label: 'ҚАЗ', fullLabel: 'Қазақша' },
    { code: 'en', label: 'ENG', fullLabel: 'English' },
  ];

  const activeLang = languages.find((l) => l.code === currentLang) || languages[0];

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode: string) => {
    // Сохраняем выбор в Cookies на 1 год
    document.cookie = `NEXT_LOCALE=${langCode}; path=/; max-age=31536000; SameSite=Lax`;

    // Перезагружаем параметры текущей страницы с сохранением поиска и категорий
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', langCode);

    setIsOpen(false);
    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition"
      >
        <Globe className="w-3.5 h-3.5 text-[#0096b1]" />
        <span>{activeLang.label}</span>
        <ChevronDown className="w-3 h-3 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl border border-gray-200 shadow-xl py-1.5 z-50 animate-fadeIn">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => changeLanguage(lang.code)}
              className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition ${
                currentLang === lang.code
                  ? 'bg-cyan-50 text-[#0096b1] font-bold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{lang.fullLabel}</span>
              <span className="text-[10px] opacity-60 uppercase">{lang.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
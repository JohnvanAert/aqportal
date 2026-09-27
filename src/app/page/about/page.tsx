import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Building2, ShieldCheck, Newspaper, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 w-full">
        {/* Назад на главную */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#0096b1] transition"
        >
          <ArrowLeft className="w-4 h-4" /> На главную
        </Link>

        {/* Шапка страницы */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-3">
            <Image
              src="/logo.png"
              alt="Aqparat.com.kz"
              width={180}
              height={45}
              className="h-10 w-auto object-contain"
            />
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">О проекте</h1>

          <div className="space-y-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-6">
            <p className="text-base font-semibold text-gray-900">
              Aqparat.com.kz — ведущий цифровой информационный портал Казахстана.
            </p>
            <p>
              Мы предоставляем нашим читателям оперативную, достоверную и объективную информацию о событиях в стране и мире. Наша цель — помогать аудитории ориентироваться в потоке новостей, предоставляя глубокую аналитику, эксклюзивные материалы и репортажи.
            </p>
            <p>
              Главный капитал нашего проекта — это доверие читателей. Мы придерживаемся высоких стандартов журналистской этики и профессионализма.
            </p>
          </div>

          {/* Иконки / Особенности */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
              <Newspaper className="w-6 h-6 text-[#0096b1] mx-auto mb-2" />
              <h3 className="font-bold text-sm text-gray-900">Оперативность</h3>
              <p className="text-xs text-gray-500 mt-1">Свежие новости 24/7</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
              <ShieldCheck className="w-6 h-6 text-[#0096b1] mx-auto mb-2" />
              <h3 className="font-bold text-sm text-gray-900">Достоверность</h3>
              <p className="text-xs text-gray-500 mt-1">Проверенные факты и источники</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
              <Award className="w-6 h-6 text-[#0096b1] mx-auto mb-2" />
              <h3 className="font-bold text-sm text-gray-900">Аналитика</h3>
              <p className="text-xs text-gray-500 mt-1">Экспертные мнения и обзоры</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Aqparat.com.kz. Все права защищены.
      </footer>
    </div>
  );
}
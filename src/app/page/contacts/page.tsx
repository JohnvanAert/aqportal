import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#0096b1] transition"
        >
          <ArrowLeft className="w-4 h-4" /> На главную
        </Link>

        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Контакты</h1>
          <p className="text-gray-600 text-sm">
            Свяжитесь с нами по любым вопросам сотрудничества, рекламы или отправки новостных материалов.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-[#0096b1] flex-shrink-0" />
                <span className="text-sm font-medium">г. Шымкент, ул. Бейбитшилик, 10</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-5 h-5 text-[#0096b1] flex-shrink-0" />
                <span className="text-sm font-medium">info@aqparat.com.kz</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-[#0096b1] flex-shrink-0" />
                <span className="text-sm font-medium">+7 (7252) 00-00-00</span>
              </div>
            </div>

            <div className="bg-cyan-50/50 p-6 rounded-2xl border border-[#0096b1]/20 space-y-3">
              <h3 className="font-bold text-sm text-gray-900">Реклама и PR</h3>
              <p className="text-xs text-gray-600">
                По вопросам размещения баннеров и рекламных публикаций:
              </p>
              <p className="text-xs font-bold text-[#0096b1]">ads@aqparat.com.kz</p>
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
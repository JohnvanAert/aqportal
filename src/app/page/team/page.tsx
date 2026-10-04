import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Users } from 'lucide-react';
import { Locale } from '@/src/lib/i18n';

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function TeamPage({ searchParams }: PageProps) {
  const { lang } = await searchParams;
  const currentLang = (lang || 'ru') as Locale;

  const content = {
    ru: {
      back: 'На главную',
      title: 'Редакция Aqparat.com.kz',
      desc: 'Команда профессиональных журналистов, редакторов и аналитиков, которые ежедневно собирают для вас самую важную и актуальную информацию.',
      managementTitle: 'Руководство',
      rights: 'Все права защищены.',
      team: [
        { name: 'Аскар Ережеп', role: 'Главный редактор', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' },
        { name: 'Динара Смагулова', role: 'Заместитель главного редактора', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300' },
        { name: 'Максим Ким', role: 'Шеф-редактор новостей', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
      ],
    },
    kk: {
      back: 'Басты бетке',
      title: 'Aqparat.com.kz Редакциясы',
      desc: 'Сіздер үшін күн сайын ең маңызды әрі өзекті ақпаратты жинайтын кәсіби журналистер, редакторлар мен сарапшылар командасы.',
      managementTitle: 'Басшылық',
      rights: 'Барлық құқықтар қорғалған.',
      team: [
        { name: 'Аскар Ережеп', role: 'Бас редактор', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' },
        { name: 'Динара Смагулова', role: 'Бас редактордың орынбасары', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300' },
        { name: 'Максим Ким', role: 'Жаңалықтардың шеф-редакторы', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
      ],
    },
    en: {
      back: 'Back to home',
      title: 'Aqparat.com.kz Newsroom',
      desc: 'A team of professional journalists, editors, and analysts who gather the most important and relevant information for you every day.',
      managementTitle: 'Management',
      rights: 'All rights reserved.',
      team: [
        { name: 'Askar Yerezhep', role: 'Editor-in-Chief', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' },
        { name: 'Dinara Smagulova', role: 'Deputy Editor-in-Chief', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300' },
        { name: 'Maxim Kim', role: 'News Bureau Chief', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
      ],
    },
  };

  const t = content[currentLang] || content.ru;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8 w-full">
        <Link
          href={`/?lang=${currentLang}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#0096b1] transition"
        >
          <ArrowLeft className="w-4 h-4" /> {t.back}
        </Link>

        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.title}</h1>
          <p className="text-gray-600 text-sm leading-relaxed">{t.desc}</p>

          <div className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0096b1]" /> {t.managementTitle}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {t.team.map((person, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center space-y-3">
                  <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-[#0096b1]/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">{person.name}</h3>
                    <p className="text-xs text-[#0096b1] font-medium mt-0.5">{person.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Aqparat.com.kz. {t.rights}
      </footer>
    </div>
  );
}
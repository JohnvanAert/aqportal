import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck, Newspaper, Award } from 'lucide-react';
import { Locale } from '@/src/lib/i18n';

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function AboutPage({ searchParams }: PageProps) {
  const { lang } = await searchParams;
  const currentLang = (lang || 'ru') as Locale;

  const content = {
    ru: {
      back: 'На главную',
      title: 'О проекте',
      p1: 'Aqparat.com.kz — ведущий цифровой информационный портал Казахстана.',
      p2: 'Мы предоставляем нашим читателям оперативную, достоверную и объективную информацию о событиях в стране и мире. Наша цель — помогать аудитории ориентироваться в потоке новостей, предоставляя глубокую аналитику, эксклюзивные материалы и репортажи.',
      p3: 'Главный капитал нашего проекта — это доверие читателей. Мы придерживаемся высоких стандартов журналистской этики и профессионализма.',
      f1Title: 'Оперативность',
      f1Desc: 'Свежие новости 24/7',
      f2Title: 'Достоверность',
      f2Desc: 'Проверенные факты и источники',
      f3Title: 'Аналитика',
      f3Desc: 'Экспертные мнения и обзоры',
      rights: 'Все права защищены.',
    },
    kk: {
      back: 'Басты бетке',
      title: 'Жоба туралы',
      p1: 'Aqparat.com.kz — Қазақстанның жетекші цифрлық ақпараттық порталы.',
      p2: 'Біз оқырмандарымызға елдегі және әлемдегі оқиғалар туралы жедел, шынайы және объективті ақпарат береміз. Біздің мақсатымыз — терең сараптамаларды, эксклюзивті материалдар мен репортаждарды ұсына отырып, аудиторияға жаңалықтар ағынында бағдар жасауға көмектесу.',
      p3: 'Біздің жобамыздың басты капиталы — оқырмандардың сенімі. Біз журналистік этика мен кәсібиліктің жоғары стандарттарын ұстанамыз.',
      f1Title: 'Жеделдік',
      f1Desc: 'Күн сайын 24/7 жаңалықтар',
      f2Title: 'Шынайылық',
      f2Desc: 'Тексерілген деректер мен көздер',
      f3Title: 'Сараптама',
      f3Desc: 'Сарапшылардың пікірлері мен шолулары',
      rights: 'Барлық құқықтар қорғалған.',
    },
    en: {
      back: 'Back to home',
      title: 'About the Project',
      p1: 'Aqparat.com.kz is a leading digital information portal in Kazakhstan.',
      p2: 'We provide our readers with prompt, reliable, and objective information about events in the country and the world. Our goal is to help the audience navigate the news flow by providing deep analytics, exclusives, and reports.',
      p3: 'The main capital of our project is the trust of our readers. We adhere to high standards of journalistic ethics and professionalism.',
      f1Title: 'Speed',
      f1Desc: 'Fresh news 24/7',
      f2Title: 'Reliability',
      f2Desc: 'Verified facts and sources',
      f3Title: 'Analytics',
      f3Desc: 'Expert opinions and reviews',
      rights: 'All rights reserved.',
    },
  };

  const t = content[currentLang] || content.ru;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 w-full">
        <Link
          href={`/?lang=${currentLang}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#0096b1] transition"
        >
          <ArrowLeft className="w-4 h-4" /> {t.back}
        </Link>

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

          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.title}</h1>

          <div className="space-y-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-6">
            <p className="text-base font-semibold text-gray-900">{t.p1}</p>
            <p>{t.p2}</p>
            <p>{t.p3}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
              <Newspaper className="w-6 h-6 text-[#0096b1] mx-auto mb-2" />
              <h3 className="font-bold text-sm text-gray-900">{t.f1Title}</h3>
              <p className="text-xs text-gray-500 mt-1">{t.f1Desc}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
              <ShieldCheck className="w-6 h-6 text-[#0096b1] mx-auto mb-2" />
              <h3 className="font-bold text-sm text-gray-900">{t.f2Title}</h3>
              <p className="text-xs text-gray-500 mt-1">{t.f2Desc}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
              <Award className="w-6 h-6 text-[#0096b1] mx-auto mb-2" />
              <h3 className="font-bold text-sm text-gray-900">{t.f3Title}</h3>
              <p className="text-xs text-gray-500 mt-1">{t.f3Desc}</p>
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
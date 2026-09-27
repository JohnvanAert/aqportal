import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Users, ShieldCheck } from 'lucide-react';

export default function TeamPage() {
  const management = [
    { name: 'Аскар Ережеп', role: 'Главный редактор', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' },
    { name: 'Динара Смагулова', role: 'Заместитель главного редактора', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300' },
    { name: 'Максим Ким', role: 'Шеф-редактор новостей', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#0096b1] transition"
        >
          <ArrowLeft className="w-4 h-4" /> На главную
        </Link>

        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Редакция Aqparat.com.kz</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Команда профессиональных журналистов, редакторов и аналитиков, которые ежедневно собирают для вас самую важную и актуальную информацию.
          </p>

          <div className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0096b1]" /> Руководство
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {management.map((person, idx) => (
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
        © {new Date().getFullYear()} Aqparat.com.kz. Все права защищены.
      </footer>
    </div>
  );
}
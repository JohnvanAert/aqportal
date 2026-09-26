'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Mail, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка входа');
        setLoading(false); // Выключаем загрузку только при ошибке
      } else {
        // Определяем роль независимо от того, как её прислал бэкенд (в user или в корне)
        const userRole = data.user?.role || data.role;

        // Принудительно перенаправляем в зависимости от роли
        if (userRole === 'ADMIN' || userRole === 'EDITOR') {
          window.location.href = '/admin'; // Используем надежный классический переход вместо router.push
        } else {
          window.location.href = '/profile';
        }
      }
    } catch (err) {
      console.error(err);
      setError('Ошибка соединения с сервером');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 relative">
        
        {/* 🏠 Ссылка На главную страницу */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#0096b1] transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> На главную
        </Link>

        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Aqparat.com.kz"
              width={180}
              height={45}
              className="h-10 w-auto object-contain mb-3"
              priority
            />
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">Вход в систему</h2>
          <p className="text-xs text-gray-400 mt-1">
            Авторизация для читателей, авторов и администраторов
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm focus:outline-none focus:border-[#0096b1] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Пароль
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm focus:outline-none focus:border-[#0096b1] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0096b1] hover:bg-[#007b92] text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md text-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Проверка...' : 'Войти'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 📝 Ссылка на регистрацию */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Ещё нет аккаунта?{' '}
            <Link
              href="/register"
              className="text-[#0096b1] font-bold hover:underline transition ml-1"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
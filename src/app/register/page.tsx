'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleCallback = async (response: any) => {
    setError('');
    setLoading(true);

    try {
        const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
        });

        const data = await res.json();

        if (!res.ok) {
        setError(data.error || 'Ошибка входа через Google');
        } else {
        setSuccess('Успешная авторизация!');
        setTimeout(() => {
            if (data.user?.role === 'ADMIN' || data.user?.role === 'EDITOR') {
            router.push('/admin');
            } else {
            router.push('/profile'); // 👈 Переход в профиль
            }
            router.refresh();
        }, 800);
        }
    } catch {
        setError('Ошибка соединения при авторизации Google');
    } finally {
        setLoading(false);
    }
    };

  const initGoogleAuth = () => {
    if (window.google?.accounts?.id && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        use_fedcm_for_prompt: false, // 🟢 Исправление FedCM ошибки
      });

      // Рендерим скрытую встроенную кнопку Google
      const btnContainer = document.getElementById('googleHiddenBtn');
      if (btnContainer) {
        window.google.accounts.id.renderButton(btnContainer, {
          theme: 'outline',
          size: 'large',
          width: '100%',
        });
      }
    }
  };

  const handleGoogleBtnClick = () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      setError('Ключ NEXT_PUBLIC_GOOGLE_CLIENT_ID не задан в .env.local');
      return;
    }

    // Имитируем клик по скрытой встроенной кнопке Google
    const googleBtn = document.getElementById('googleHiddenBtn')?.querySelector('div[role="button"]') as HTMLElement;
    if (googleBtn) {
      googleBtn.click();
    } else if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  // 2. При обычной форме регистрации:
    const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
        setError('Пароль должен содержать минимум 6 символов');
        return;
    }

    setLoading(true);

    try {
        const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
        setError(data.error || 'Ошибка при регистрации');
        } else {
        setSuccess('Регистрация успешна! Переход в личный кабинет...');
        setTimeout(() => {
            router.push('/profile'); // 👈 Переход в профиль
            router.refresh();
        }, 1000);
        }
    } catch {
        setError('Ошибка соединения с сервером');
    } finally {
        setLoading(false);
    }
    };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={initGoogleAuth}
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 p-8 shadow-sm relative">
          
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#0096b1] transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> На главную
          </Link>

          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-3">
              <Image
                src="/logo.png"
                alt="Aqparat.com.kz"
                width={160}
                height={40}
                className="h-9 w-auto mx-auto object-contain"
                priority
              />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Регистрация аккаунта</h1>
            <p className="text-xs text-gray-500 mt-1">
              Создайте профиль, чтобы оставлять комментарии и участвовать в обсуждениях
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Ваше Имя
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-[#0096b1] transition"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-[#0096b1] transition"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Пароль
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-[#0096b1] transition"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0096b1] hover:bg-[#007b92] text-white font-bold py-3.5 rounded-xl transition shadow-md text-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Создание...' : 'Зарегистрироваться'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Разделитель */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-medium">ИЛИ</span>
            </div>
          </div>

          {/* Скрытый контейнер для инициализации Google кнопки */}
          <div id="googleHiddenBtn" className="hidden" />

          {/* Кастомная стилизованная кнопка */}
          <button
            type="button"
            onClick={handleGoogleBtnClick}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 border border-gray-300 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Войти через Google
          </button>

          <p className="text-center text-xs text-gray-500 mt-6">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-[#0096b1] font-bold hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
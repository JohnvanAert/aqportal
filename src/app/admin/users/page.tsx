'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  UserPlus,
  Users,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'USER';
  createdAt: string;
}

export default function UsersPage() {
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'EDITOR' | 'ADMIN' | 'USER'>('EDITOR');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Состояние для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5; // Количество пользователей на страницу

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) {
        setUsersList(data.users);
      }
    } catch {
      setError('Ошибка при загрузке списка пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Ручное создание сотрудника администратором
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка создания пользователя');
      } else {
        setSuccess(`Пользователь ${email} успешно создан!`);
        setEmail('');
        setPassword('');
        setName('');
        fetchUsers();
      }
    } catch {
      setError('Ошибка соединения с сервером');
    } finally {
      setSubmitting(false);
    }
  };

  // Изменение роли зарегистрированного пользователя (USER -> EDITOR / EDITOR -> USER)
  const handleRoleChange = async (userId: string, newRole: 'USER' | 'EDITOR' | 'ADMIN') => {
    setUpdatingId(userId);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`Роль пользователя успешно изменена на ${newRole}`);
        fetchUsers();
      } else {
        setError(data.error || 'Не удалось обновить роль');
      }
    } catch {
      setError('Ошибка соединения при смене роли');
    } finally {
      setUpdatingId(null);
    }
  };

  // Логика пагинации
  const totalPages = Math.ceil(usersList.length / PAGE_SIZE) || 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentUsers = usersList.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black transition"
          >
            <ArrowLeft className="w-4 h-4" /> Назад в панель управления
          </Link>
          <span className="text-xs bg-black text-white px-3 py-1 rounded-full font-bold">
            Управление пользователями
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Форма добавления сотрудника вручную */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-[#0096b1]" /> Создать учетную запись
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">ФИО / Имя</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Аскар Ережеп"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="editor@aqparat.com.kz"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Пароль *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Роль *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'EDITOR' | 'ADMIN' | 'USER')}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#0096b1]"
                >
                  <option value="USER">USER (Зарегистрированный читатель)</option>
                  <option value="EDITOR">EDITOR (Редактор статей)</option>
                  <option value="ADMIN">ADMIN (Главный Администратор)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0096b1] hover:bg-[#007b92] text-white font-bold py-3 rounded-xl transition duration-200 shadow-md text-sm disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Создание...' : 'Создать пользователя'}
              </button>
            </form>
          </div>

          {/* Таблица пользователей с пагинацией */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between">
            <div>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#0096b1]" /> Пользователи и Редакторы ({usersList.length})
                </h2>
              </div>

              {loading ? (
                <div className="p-12 text-center text-sm text-gray-400 flex justify-center items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#0096b1]" /> Загрузка пользователей...
                </div>
              ) : currentUsers.length === 0 ? (
                <div className="p-12 text-center text-sm text-gray-400">
                  Пользователей пока нет.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-[11px] tracking-wider border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3">Пользователь</th>
                        <th className="px-6 py-3">Текущая Роль</th>
                        <th className="px-6 py-3">Дата регистрации</th>
                        <th className="px-6 py-3 text-right">Управление</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {currentUsers.map((userItem) => (
                        <tr key={userItem.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{userItem.name || 'Без имени'}</div>
                            <div className="text-xs text-gray-400">{userItem.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            {userItem.role === 'ADMIN' && (
                              <span className="bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1 w-fit">
                                <ShieldCheck className="w-3 h-3 text-[#0096b1]" /> ADMIN
                              </span>
                            )}
                            {userItem.role === 'EDITOR' && (
                              <span className="bg-cyan-50 text-[#0096b1] border border-[#0096b1]/20 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase w-fit inline-block">
                                EDITOR
                              </span>
                            )}
                            {userItem.role === 'USER' && (
                              <span className="bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase w-fit inline-block">
                                USER
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-400">
                            {new Date(userItem.createdAt).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {userItem.role !== 'ADMIN' && (
                              <div className="flex items-center justify-end gap-2">
                                {userItem.role === 'USER' ? (
                                  <button
                                    type="button"
                                    disabled={updatingId === userItem.id}
                                    onClick={() => handleRoleChange(userItem.id, 'EDITOR')}
                                    className="inline-flex items-center gap-1 bg-[#0096b1] hover:bg-[#007b92] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-sm disabled:opacity-50 cursor-pointer"
                                  >
                                    <ArrowUpRight className="w-3.5 h-3.5" /> Назначить Редактором
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={updatingId === userItem.id}
                                    onClick={() => handleRoleChange(userItem.id, 'USER')}
                                    className="inline-flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
                                  >
                                    <ArrowDownRight className="w-3.5 h-3.5" /> Понизить до User
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Панель переключения страниц */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50">
                <span>
                  Страница <strong className="text-gray-800">{currentPage}</strong> из <strong className="text-gray-800">{totalPages}</strong> (всего пользователей: {usersList.length})
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage <= 1}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 transition flex items-center gap-1 font-semibold disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Назад
                  </button>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                    className="px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 transition flex items-center gap-1 font-semibold disabled:opacity-40 cursor-pointer"
                  >
                    Вперед <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
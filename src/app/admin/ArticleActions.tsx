'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit2, Trash2, Loader2 } from 'lucide-react';

export default function ArticleActions({ articleId }: { articleId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту новость?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Не удалось удалить новость');
      }
    } catch {
      alert('Ошибка при удалении');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/articles/edit/${articleId}`}
        className="p-1.5 text-gray-500 hover:text-[#0096b1] hover:bg-gray-100 rounded-lg transition"
        title="Редактировать"
      >
        <Edit2 className="w-4 h-4" />
      </Link>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
        title="Удалить"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
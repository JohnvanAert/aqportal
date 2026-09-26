'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, X } from 'lucide-react';

interface CommentFormProps {
  articleId: string;
  parentId?: string;
  placeholder?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function CommentForm({
  articleId,
  parentId,
  placeholder = 'Напишите ваш комментарий...',
  onCancel,
  onSuccess,
}: CommentFormProps) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, text, parentId }),
      });

      if (res.ok) {
        setText('');
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Ошибка при отправке комментария');
      }
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      {error && <div className="mb-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl">{error}</div>}
      <div className="relative">
        <textarea
          rows={parentId ? 2 : 3}
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-[#0096b1] transition resize-none"
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 text-gray-500 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="bg-[#0096b1] hover:bg-[#007b92] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Отправить
          </button>
        </div>
      </div>
    </form>
  );
}
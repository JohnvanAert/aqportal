'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, Reply } from 'lucide-react';
import CommentForm from './CommentForm';

export interface CommentType {
  id: string;
  text: string;
  createdAt: Date;
  userName: string;
  parentId?: string | null;
  replies?: CommentType[];
}

interface CommentItemProps {
  comment: CommentType;
  articleId: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

export default function CommentItem({
  comment,
  articleId,
  isAdmin,
  isAuthenticated,
}: CommentItemProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Не удалось удалить комментарий');
      }
    } catch {
      alert('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 transition hover:border-gray-300 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-sm text-gray-900">
          {comment.userName}
        </span>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-400">
            {new Date(comment.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>

          {/* Кнопка "Удалить" для админа/редактора */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              title="Удалить комментарий"
              className="text-red-500 hover:text-red-700 transition p-1 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
        {comment.text}
      </p>

      {/* Кнопка "Ответить" */}
      {isAuthenticated && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsReplying(!isReplying)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0096b1] hover:text-[#007b92] transition"
          >
            <Reply className="w-3.5 h-3.5" /> Ответить
          </button>
        </div>
      )}

      {/* Всплывающая форма ответа */}
      {isReplying && (
        <div className="mt-3 pl-2 border-l-2 border-[#0096b1]/30">
          <CommentForm
            articleId={articleId}
            parentId={comment.id}
            placeholder={`Ответ для ${comment.userName}...`}
            onCancel={() => setIsReplying(false)}
            onSuccess={() => setIsReplying(false)}
          />
        </div>
      )}

      {/* Вложенные ответы */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 pl-4 sm:pl-6 space-y-3 border-l-2 border-gray-200">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              articleId={articleId}
              isAdmin={isAdmin}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
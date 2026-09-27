'use client';

import { useState } from 'react';
import CommentItem, { CommentType } from '@/src/components/CommentItem';

interface CommentListWrapperProps {
  rootComments: CommentType[];
  articleId: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

export default function CommentListWrapper({
  rootComments,
  articleId,
  isAdmin,
  isAuthenticated,
}: CommentListWrapperProps) {
  const PAGE_SIZE = 15; // Показываем по 15 корневых веток за раз
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const displayedComments = rootComments.slice(0, visibleCount);
  const hasMore = visibleCount < rootComments.length;

  return (
    <div className="space-y-4">
      {displayedComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          articleId={articleId}
          isAdmin={isAdmin}
          isAuthenticated={isAuthenticated}
        />
      ))}

      {hasMore && (
        <div className="pt-4 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Загрузить еще комментарии ({rootComments.length - visibleCount} осталось)
          </button>
        </div>
      )}
    </div>
  );
}
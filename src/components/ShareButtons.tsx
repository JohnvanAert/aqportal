'use client';

import { useState, useEffect } from 'react';
import { Send, MessageCircle, Share2, Check, Copy } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url?: string;
}

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url || '');

  // Подставляем реальный URL только после маунта на клиенте
  useEffect(() => {
    if (!url && typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, [url]);

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-[#229ED9] hover:bg-[#1d8bbd]',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366] hover:bg-[#20bd5a]',
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: 'VK',
      icon: Share2,
      color: 'bg-[#4C75A3] hover:bg-[#3f6289]',
      href: `https://vk.com/share.php?url=${encodedUrl}&title=${encodedTitle}`,
    },
    {
      name: 'Facebook',
      icon: FacebookIcon,
      color: 'bg-[#1877F2] hover:bg-[#1464cc]',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'X',
      icon: XIcon,
      color: 'bg-black hover:bg-gray-800',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = currentUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-4 my-6 border-y border-gray-100">
      <span className="text-xs font-bold uppercase text-gray-500 mr-2">
        Поделиться:
      </span>

      {shareLinks.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Поделиться в ${item.name}`}
            className={`flex items-center gap-2 text-white px-3 py-2 rounded-xl text-xs font-semibold transition shadow-sm ${item.color}`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{item.name}</span>
          </a>
        );
      })}

      <button
        type="button"
        onClick={handleCopy}
        title="Скопировать ссылку"
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
          copied
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            <span>Скопировано!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 text-gray-600" />
            <span className="hidden sm:inline">Ссылка</span>
          </>
        )}
      </button>
    </div>
  );
}
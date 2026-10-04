import type { Metadata } from "next";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aqparat.com.kz';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Aqparat.com.kz — Главные новости Казахстана и мира",
    template: "%s | Aqparat.com.kz",
  },
  description: "Оперативные новости политики, экономики, спорта, культуры и экологии в Казахстане и мире на русском, казахском и английском языках.",
  keywords: ["новости Казахстана", "Aqparat", "Шымкент новости", "политика", "экономика", "экология", "спорт"],
  authors: [{ name: "Aqparat Newsroom" }],
  creator: "Aqparat.com.kz",
  publisher: "Aqparat.com.kz",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: baseUrl,
    siteName: 'Aqparat.com.kz',
    title: 'Aqparat.com.kz — Главные новости Казахстана и мира',
    description: 'Информационный портал с актуальными новостями и аналитикой.',
    images: [
      {
        url: '/logo.png', // Убедитесь, что логотип доступен в публичной папке
        width: 1200,
        height: 630,
        alt: 'Aqparat.com.kz Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aqparat.com.kz — Главные новости',
    description: 'Оперативные новости Казахстана и мира',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
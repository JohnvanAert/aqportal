import { db } from '@/src/db';
import { articles } from '@/src/db/schema';
import { NextResponse } from 'next/server';

export const revalidate = 3600; // Кэшировать на 1 час

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aqparat.com.kz';

  // Получаем все статьи из базы
  const allArticles = await db.select({ slug: articles.slug, publishedAt: articles.publishedAt }).from(articles);

  const staticPages = [
    '',
    '/page/about',
    '/page/team',
    '/page/contacts',
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Добавляем статические страницы
  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${page}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += `  </url>\n`;
  }

  // Добавляем статьи на трех языках
  for (const article of allArticles) {
    const lastMod = article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString();
    
    ['ru', 'kk', 'en'].forEach((lang) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/news/${article.slug}?lang=${lang}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `  </url>\n`;
    });
  }

  xml += `</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
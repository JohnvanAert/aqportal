import { db } from '@/src/db';
import { articles } from '@/src/db/schema';

export default async function sitemap() {
  const baseUrl = 'https://aqparat.com.kz';

  // Получаем все статьи
  const allArticles = await db.select({ slug: articles.slug, publishedAt: articles.publishedAt }).from(articles);

  const articleUrls = allArticles.flatMap((article) => [
    { url: `${baseUrl}/news/${article.slug}?lang=ru`, lastModified: article.publishedAt },
    { url: `${baseUrl}/news/${article.slug}?lang=kk`, lastModified: article.publishedAt },
    { url: `${baseUrl}/news/${article.slug}?lang=en`, lastModified: article.publishedAt },
  ]);

  return [
    { url: baseUrl, lastModified: new Date() },
    ...articleUrls,
  ];
}
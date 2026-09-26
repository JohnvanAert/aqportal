import 'dotenv/config';
import { db } from './index';
import { categories, articles } from './schema';

async function main() {
  console.log('Заполнение базы данных Neon началось...');

  // 1. Создаем категории
  const [newsCat] = await db.insert(categories).values({
    name: 'Новости',
    slug: 'news',
  }).returning();

  const [sportCat] = await db.insert(categories).values({
    name: 'Спорт',
    slug: 'sport',
  }).returning();

  const [healthCat] = await db.insert(categories).values({
    name: 'Здоровье',
    slug: 'health',
  }).returning();

  // 2. Главная новость (Hero)
  await db.insert(articles).values({
    title: 'Министр обороны посетил семьи военнослужащих, погибших в Каспийском море',
    slug: 'ministr-oborony-posetil-semi-voennosluzhashchih',
    content: 'Министр обороны высказал глубокие соболезнования родным и близким погибших...',
    summary: 'Соболезнования и поддержка семьям военнослужащих.',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200',
    isHero: true,
    viewsCount: 24182,
    categoryId: newsCat.id,
  });

  // 3. Второстепенные новости
  await db.insert(articles).values([
    {
      title: 'Акимом Жанаозена назначен экс-глава отдела по противодействию коррупции',
      slug: 'akimom-zhanaozena-naznachen-eks-glava',
      content: 'В Жанаозене представили нового акима города...',
      imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=600',
      viewsCount: 15400,
      categoryId: newsCat.id,
    },
    {
      title: 'Трагедия на Каспии: в Актау простились с 20-летним призёром',
      slug: 'tragediya-na-kaspii-v-aktau-prostilis',
      content: 'Прощальная церемония прошла со всеми воинскими почестями...',
      imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600',
      viewsCount: 18900,
      categoryId: newsCat.id,
    },
    {
      title: 'Дебют Зидана и фиаско Италии: как прошёл тур Лиги наций',
      slug: 'debyut-zidana-i-fiasko-italii',
      content: 'Разбор главных матчей прошедшего уикенда...',
      viewsCount: 3708,
      categoryId: sportCat.id,
    },
    {
      title: 'Второе дыхание. Какие симптомы могут быть началом ревматического заболевания',
      slug: 'vtoroe-dyhanie-simptomy-revmaticheskogo-zabolevaniya',
      content: 'Медики рассказали, на какие сигналы организма стоит обратить внимание...',
      viewsCount: 1793,
      categoryId: healthCat.id,
    },
  ]);

  console.log('Тестовые данные успешно записаны в Neon через Drizzle!');
}

main().catch((err) => {
  console.error('Ошибка сида:', err);
  process.exit(1);
});
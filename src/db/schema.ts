import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { AnyPgColumn } from 'drizzle-orm/pg-core';
export const roleEnum = pgEnum('role', ['USER', 'EDITOR', 'ADMIN']);

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  password: text('password'), // может быть null при Google OAuth
  name: text('name'),
  avatar: text('avatar'),
  role: roleEnum('role').default('USER').notNull(),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  verificationCode: text('verification_code'),
  googleId: text('google_id').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Категории (RU / KK / EN)
export const categories = pgTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),       // RU (по умолчанию)
  nameKk: text('name_kk'),           // KK
  nameEn: text('name_en'),           // EN
  slug: text('slug').notNull().unique(),
});

// Статьи (RU / KK / EN)
export const articles = pgTable('articles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),       // RU
  titleKk: text('title_kk'),           // KK
  titleEn: text('title_en'),           // EN
  
  slug: text('slug').notNull().unique(),
  
  content: text('content').notNull(),   // RU
  contentKk: text('content_kk'),       // KK
  contentEn: text('content_en'),       // EN
  
  summary: text('summary'),             // RU
  summaryKk: text('summary_kk'),       // KK
  summaryEn: text('summary_en'),       // EN
  
  imageUrl: text('image_url'),
  isHero: boolean('is_hero').default(false).notNull(),
  viewsCount: integer('views_count').default(0).notNull(),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
  categoryId: text('category_id').references(() => categories.id).notNull(),
}, (table) => ({
  categoryIdx: index('category_idx').on(table.categoryId),
  publishedAtIdx: index('published_at_idx').on(table.publishedAt),
}));

export const comments = pgTable('comments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  articleId: text('article_id').references(() => articles.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  // Поле для связи ответа с родительским комментарием
  parentId: text('parent_id').references((): AnyPgColumn => comments.id, { onDelete: 'cascade' }),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  article: one(articles, {
    fields: [comments.articleId],
    references: [articles.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const bookmarks = pgTable('bookmarks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  articleId: text('article_id').references(() => articles.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(), // Уникальный токен сессии (например, UUID или случайная строка)
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
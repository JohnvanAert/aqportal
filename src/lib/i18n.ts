export type Locale = 'ru' | 'kk' | 'en';

export const dictionaries = {
  ru: {
    all: 'Все',
    searchPlaceholder: 'Поиск новостей...',
    readAlso: 'Читать также',
    latestNews: 'Последние',
    share: 'Поделиться:',
    views: 'просмотров',
    comments: 'Комментарии',
    writeComment: 'Напишите ваш комментарий...',
    send: 'Отправить',
    wantComment: 'Хотите оставить комментарий?',
    loginPrompt: 'Войдите или зарегистрируйтесь, чтобы принять участие в обсуждении новости.',
    login: 'Войти',
    register: 'Регистрация',
    noComments: 'Пока нет комментариев. Будьте первым, кто поделится мнением!',
    heroTag: 'Главная новость',
  },
  kk: {
    all: 'Барлығы',
    searchPlaceholder: 'Жаңалықтарды өңдеу...',
    readAlso: 'Тағы оқыңыздар',
    latestNews: 'Соңғы жаңалықтар',
    share: 'Бөлісу:',
    views: 'қаралым',
    comments: 'Пікірлер',
    writeComment: 'Пікіріңізді жазыңыз...',
    send: 'Жіберу',
    wantComment: 'Пікір қалдырғыңыз келе ме?',
    loginPrompt: 'Талқылауға қатысу үшін жүйеге кіріңіз немесе тіркеліңіз.',
    login: 'Кіру',
    register: 'Тіркелу',
    noComments: 'Әзірге пікірлер жоқ. Алғашқы болып өз ойыңызбен бөлісіңіз!',
    heroTag: 'Басты жаңалық',
  },
  en: {
    all: 'All',
    searchPlaceholder: 'Search news...',
    readAlso: 'Read also',
    latestNews: 'Latest',
    share: 'Share:',
    views: 'views',
    comments: 'Comments',
    writeComment: 'Write your comment...',
    send: 'Send',
    wantComment: 'Want to leave a comment?',
    loginPrompt: 'Sign in or register to join the discussion.',
    login: 'Sign in',
    register: 'Register',
    noComments: 'No comments yet. Be the first to share your opinion!',
    heroTag: 'Top Story',
  },
};

export function getLocalizedField<T extends Record<string, any>>(
  item: T | null | undefined,
  field: 'title' | 'summary' | 'content' | 'name',
  locale: Locale
): string {
  if (!item) return '';

  if (locale === 'kk') {
    // Проверяем оба стиля именования полей в объекте: camelCase (titleKk) и snake_case (title_kk)
    const val = item[`${field}Kk`] ?? item[`${field}_kk`];
    if (val && typeof val === 'string' && val.trim() !== '') {
      return val;
    }
  }

  if (locale === 'en') {
    const val = item[`${field}En`] ?? item[`${field}_en`];
    if (val && typeof val === 'string' && val.trim() !== '') {
      return val;
    }
  }

  // Фоллбек на русскую версию (по умолчанию)
  return item[field] ? String(item[field]) : '';
}
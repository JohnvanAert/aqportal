import { NextResponse } from 'next/server';
import { getSession } from '@/src/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const { text, from, to } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ translatedText: '' });
    }

    // Включение подмены бесплатного сервера клиентского API
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
      from
    )}&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (res.status === 429) {
      return NextResponse.json(
        { error: 'Слишком много запросов. Подождите 10-15 секунд.' },
        { status: 429 }
      );
    }

    if (!res.ok) {
      throw new Error(`Google Translate status ${res.status}`);
    }

    const rawText = await res.text();
    const data = JSON.parse(rawText);

    const translatedText = data && data[0] ? data[0].map((item: any) => item[0]).join('') : '';

    return NextResponse.json({ translatedText });
  } catch (err) {
    console.error('Translation error:', err);
    return NextResponse.json({ error: 'Ошибка автоперевода' }, { status: 500 });
  }
}
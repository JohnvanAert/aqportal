import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSession } from '@/src/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 });
    }

    // Лимит 2 МБ (2 * 1024 * 1024 байт)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Размер файла превышает допустимый лимит 2 МБ' },
        { status: 400 }
      );
    }

    // Если подключен BLOB_READ_WRITE_TOKEN, грузим в Vercel Blob, иначе конвертируем в DataURL/Base64
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(file.name, file, { access: 'public' });
      return NextResponse.json({ url: blob.url });
    } else {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;
      return NextResponse.json({ url: dataUrl });
    }
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Ошибка при загрузке файла' }, { status: 500 });
  }
}
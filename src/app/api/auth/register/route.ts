import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже зарегистрирован' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Генерируем 6-значный код подтверждения
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Создаем пользователя с ролью USER по умолчанию
    await db.insert(users).values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'USER', // 🔒 Только USER!
      isEmailVerified: false,
      verificationCode,
    });

    // TODO: Здесь вызов отправки письма через Resend / Nodemailer с кодом verificationCode

    return NextResponse.json({
      success: true,
      message: 'Код подтверждения отправлен на вашу почту',
    });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
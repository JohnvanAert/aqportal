import 'dotenv/config';
import { db } from './index';
import { users } from './schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function createAdmin() {
  const email = 'admin@tengrinews.kz';
  const rawPassword = 'adminpassword123';

  // Проверяем, существует ли уже такой пользователь
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  if (existingUser) {
    await db.update(users)
      .set({ role: 'ADMIN', password: hashedPassword })
      .where(eq(users.email, email));
    console.log(`Права пользователя ${email} обновлены до ADMIN!`);
  } else {
    await db.insert(users).values({
      email,
      name: 'Главный Редактор',
      password: hashedPassword,
      role: 'ADMIN',
    });
    console.log('✅ Главный админ успешно создан!');
  }

  console.log('-----------------------------------');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${rawPassword}`);
  console.log('-----------------------------------');
}

createAdmin().catch(console.error);
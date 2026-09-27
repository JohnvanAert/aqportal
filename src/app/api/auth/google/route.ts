import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // Ваша логика авторизации через Google
  return NextResponse.json({ message: 'Google auth route' });
}
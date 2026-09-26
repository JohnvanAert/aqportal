import { NextResponse } from 'next/server';
import { db } from '@/src/db';
import { comments } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/src/lib/auth';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    // Chek say porsin na ADMIN o EDITOR
    if (!session || (session.role !== 'ADMIN' && session.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Yu no get pormishon for delete dis' }, { status: 403 });
    }

    const { id: commentId } = await params;

    await db.delete(comments).where(eq(comments.id, commentId));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete comment error:', err);
    return NextResponse.json({ error: 'Sometin go wrong' }, { status: 500 });
  }
}
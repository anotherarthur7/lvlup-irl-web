// app/api/activities/route.ts (защищенная версия)
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const activities = await prisma.activity.findMany({
    where: { user: { email: session.user.email } },
    orderBy: { createdAt: 'desc' }
  });
  
  return NextResponse.json(activities);
}

export async function POST(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { name, icon, color } = await request.json();
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  
  const activity = await prisma.activity.create({
    data: {
      name,
      icon,
      color,
      userId: user!.id
    }
  });
  
  return NextResponse.json(activity);
}
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: { agent: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.agent) {
      return NextResponse.json({ error: 'No agent found. Create one first.' }, { status: 400 });
    }

    const agent = await prisma.userAgent.update({
      where: { userId: user.id },
      data: {
        status: 'active',
        lastActive: new Date(),
      },
    });

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Error activating agent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

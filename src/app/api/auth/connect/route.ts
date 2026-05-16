import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateTier } from '@/lib/tiers';

export async function POST(request: Request) {
  try {
    const { walletAddress, piUid, piUsername } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { walletAddress },
      include: { actions: true, agent: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          xp: 0,
          tier: 'Ghost',
        },
        include: { actions: true, agent: true },
      });
    } else {
      const currentTier = calculateTier(user.xp);
      if (currentTier !== user.tier) {
        user = await prisma.user.update({
          where: { walletAddress },
          data: { tier: currentTier },
          include: { actions: true, agent: true },
        });
      }
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

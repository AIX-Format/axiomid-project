import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateTier } from '@/lib/tiers';

export async function POST(request: Request) {
  try {
    const { walletAddress, piUid, piUsername, accessToken } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    if (accessToken) {
      const meRes = await fetch('https://api.minepi.com/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!meRes.ok) {
        return NextResponse.json({ error: 'Invalid Pi access token' }, { status: 401 });
      }

      const me: { uid: string; username: string } = await meRes.json();

      if (piUid && me.uid !== piUid) {
        return NextResponse.json({ error: 'UID mismatch' }, { status: 403 });
      }
    }

    let user = await prisma.user.findUnique({
      where: { walletAddress },
      include: { actions: true, agent: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          piUsername: piUsername || null,
          xp: 0,
          tier: 'Ghost',
        },
        include: { actions: true, agent: true },
      });
    } else if (piUsername && piUsername !== user.piUsername) {
      user = await prisma.user.update({
        where: { walletAddress },
        data: { piUsername },
        include: { actions: true, agent: true },
      });
    }

    const currentTier = calculateTier(user.xp);
    if (currentTier !== user.tier) {
      user = await prisma.user.update({
        where: { walletAddress },
        data: { tier: currentTier },
        include: { actions: true, agent: true },
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

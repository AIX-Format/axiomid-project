import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateTier } from '@/lib/tiers';
import { verifySignature } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { message, signature } = await request.json();

    if (!message || !signature) {
      return NextResponse.json({ error: 'Message and signature required' }, { status: 400 });
    }

    // SIWE Verification
    const { success, data, error } = await verifySignature(message, signature);

    if (!success || !data) {
        console.error('SIWE Verification failed:', error);
        return NextResponse.json({ error: 'Invalid signature', details: error?.message }, { status: 401 });
    }

    const walletAddress = data.address;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress },
      include: { actions: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          xp: 0,
          tier: 'Ghost',
        },
        include: { actions: true },
      });
    } else {
        // Recalculate tier just in case
        const currentTier = calculateTier(user.xp);
        if (currentTier !== user.tier) {
            user = await prisma.user.update({
                where: { walletAddress },
                data: { tier: currentTier },
                include: { actions: true },
            });
        }
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

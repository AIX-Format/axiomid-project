import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateTier } from '@/lib/tiers';
import { verifyWalletSignature, AUTH_MESSAGE_TEMPLATE, isValidWalletAddress } from '@/lib/auth';

const SIGNATURE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes for connect

export async function POST(request: Request) {
  try {
    const { walletAddress, signature, timestamp } = await request.json();

    if (!walletAddress || !signature || !timestamp) {
      return NextResponse.json({ error: 'Missing parameters', details: 'walletAddress, signature, and timestamp are required' }, { status: 400 });
    }

    // 1. Validate wallet address format
    if (!isValidWalletAddress(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    // 2. Validate timestamp
    const now = Date.now();
    const ts = Number(timestamp);
    if (isNaN(ts) || Math.abs(now - ts) > SIGNATURE_EXPIRATION_MS) {
      return NextResponse.json({ error: 'Signature expired or invalid timestamp' }, { status: 401 });
    }

    // 3. Verify Signature
    const message = AUTH_MESSAGE_TEMPLATE('connect_wallet', walletAddress, ts);
    const isVerified = await verifyWalletSignature(walletAddress, signature, message);

    if (!isVerified) {
      return NextResponse.json({ error: 'Invalid signature', message: 'Unauthorized wallet owner' }, { status: 401 });
    }

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

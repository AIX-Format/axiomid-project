import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateTier } from '@/lib/tiers';
import { ACTIONS } from '@/lib/actions';
import { verifyWalletSignature, AUTH_MESSAGE_TEMPLATE, isValidWalletAddress } from '@/lib/auth';

const SIGNATURE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(request: Request) {
  try {
    const { walletAddress, actionType, signature, timestamp } = await request.json();

    if (!walletAddress || !actionType || !signature || !timestamp) {
      return NextResponse.json({ error: 'Missing parameters', details: 'walletAddress, actionType, signature, and timestamp are required' }, { status: 400 });
    }

    // 1. Validate wallet address format
    if (!isValidWalletAddress(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    // 2. Validate timestamp (anti-replay)
    const now = Date.now();
    const ts = Number(timestamp);
    if (isNaN(ts) || Math.abs(now - ts) > SIGNATURE_EXPIRATION_MS) {
      return NextResponse.json({ error: 'Signature expired or invalid timestamp' }, { status: 401 });
    }

    // 3. Verify Signature
    const message = AUTH_MESSAGE_TEMPLATE(actionType, walletAddress, ts);
    const isVerified = await verifyWalletSignature(walletAddress, signature, message);

    if (!isVerified) {
      return NextResponse.json({ error: 'Invalid signature', message: 'Unauthorized wallet owner' }, { status: 401 });
    }

    // 4. Validate Action Type
    const actionDef = Object.values(ACTIONS).find(a => a.id === actionType);

    if (!actionDef) {
      return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
    }

    // 5. Find User
    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 6. Check if action already performed (unless it's repeatable like daily)
    if (actionType !== 'daily_pow') {
      const existingAction = await prisma.action.findFirst({
        where: {
          userId: user.id,
          type: actionType,
        },
      });

      if (existingAction) {
        return NextResponse.json({ error: 'Action already claimed' }, { status: 400 });
      }
    }

    // 7. Check daily pow cooldown
    if (actionType === 'daily_pow') {
      const lastDaily = await prisma.action.findFirst({
        where: {
          userId: user.id,
          type: 'daily_pow',
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      if (lastDaily) {
        const diff = Date.now() - new Date(lastDaily.timestamp).getTime();
        if (diff < 24 * 60 * 60 * 1000) {
          return NextResponse.json({ error: 'Daily claim cooldown' }, { status: 400 });
        }
      }
    }

    // 8. Create Action
    await prisma.action.create({
      data: {
        userId: user.id,
        type: actionType,
        xp: actionDef.xp,
      },
    });

    // 9. Update User XP & Tier
    const newXP = user.xp + actionDef.xp;
    const newTier = calculateTier(newXP);

    const updatedUser = await prisma.user.update({
      where: { walletAddress },
      data: {
        xp: newXP,
        tier: newTier,
      },
    });

    return NextResponse.json({ user: updatedUser, earned: actionDef.xp });
  } catch (error) {
    console.error('Error claiming action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

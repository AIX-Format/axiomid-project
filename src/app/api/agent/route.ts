import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  try {
    const { walletAddress, name } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existing = await prisma.userAgent.findUnique({ where: { userId: user.id } });
    if (existing) {
      const updated = await prisma.userAgent.update({
        where: { userId: user.id },
        data: { name: name || existing.name },
      });
      return NextResponse.json({ agent: updated });
    }

    const apiKey = `axm_${randomBytes(24).toString('hex')}`;

    const agent = await prisma.userAgent.create({
      data: {
        userId: user.id,
        name: name || 'My Agent',
        status: 'inactive',
        apiKeyHash: apiKey,
        permissions: JSON.stringify(['claim', 'verify']),
      },
    });

    return NextResponse.json({ agent, apiKey });
  } catch (error) {
    console.error('Error managing agent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

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

    return NextResponse.json({ agent: user.agent });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

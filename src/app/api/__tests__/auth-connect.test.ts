import { prisma } from '../../../lib/prisma';
import { calculateTier } from '../../../lib/tiers';
import { verifySignature } from '../../../lib/auth';
import { POST } from '../auth/connect/route';
import { NextResponse } from 'next/server';

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status || 200,
      json: async () => body,
    })),
  },
}));

// Mock prisma
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock tiers
jest.mock('../../../lib/tiers', () => ({
  calculateTier: jest.fn(),
}));

// Mock auth
jest.mock('../../../lib/auth', () => ({
  verifySignature: jest.fn(),
}));

describe('POST /api/auth/connect', () => {
  const mockWalletAddress = '0x1234567890123456789012345678901234567890';
  const mockMessage = 'Sign in with Ethereum to AxiomID';
  const mockSignature = '0xsignature';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if message or signature is missing', async () => {
    const req = {
      json: async () => ({}),
    } as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Message and signature required');
  });

  it('should return 401 if SIWE verification fails', async () => {
    (verifySignature as jest.Mock).mockResolvedValue({
        success: false,
        error: new Error('Invalid signature')
    });

    const req = {
      json: async () => ({ message: mockMessage, signature: mockSignature }),
    } as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Invalid signature');
  });

  it('should create a new user if not found', async () => {
    (verifySignature as jest.Mock).mockResolvedValue({
        success: true,
        data: { address: mockWalletAddress }
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({
      walletAddress: mockWalletAddress,
      xp: 0,
      tier: 'Ghost',
      actions: [],
    });

    const req = {
      json: async () => ({ message: mockMessage, signature: mockSignature }),
    } as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.user.walletAddress).toBe(mockWalletAddress);
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('should return existing user and update tier if necessary', async () => {
    const existingUser = {
      walletAddress: mockWalletAddress,
      xp: 150,
      tier: 'Ghost', // Outdated tier
      actions: [],
    };

    (verifySignature as jest.Mock).mockResolvedValue({
        success: true,
        data: { address: mockWalletAddress }
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
    (calculateTier as jest.Mock).mockReturnValue('Spark');
    (prisma.user.update as jest.Mock).mockResolvedValue({
      ...existingUser,
      tier: 'Spark',
    });

    const req = {
      json: async () => ({ message: mockMessage, signature: mockSignature }),
    } as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.user.tier).toBe('Spark');
    expect(prisma.user.update).toHaveBeenCalled();
  });

  it('should return 500 on internal error', async () => {
    (verifySignature as jest.Mock).mockRejectedValue(new Error('Internal error'));

    const req = {
      json: async () => ({ message: mockMessage, signature: mockSignature }),
    } as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});

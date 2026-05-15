import { prisma } from '../../../lib/prisma';
import { calculateTier } from '../../../lib/tiers';
import { ACTIONS } from '../../../lib/actions';
import { POST } from '../action/claim/route';
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
      update: jest.fn(),
    },
    action: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock tiers
jest.mock('../../../lib/tiers', () => ({
  calculateTier: jest.fn(),
}));

describe('POST /api/action/claim', () => {
  const mockWalletAddress = '0x1234567890123456789012345678901234567890';
  const mockActionType = 'connect_twitter';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if parameters are missing', async () => {
    const req = {
      json: async () => ({}),
    } as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Missing parameters');
  });

  it('should return 400 for invalid action type', async () => {
    const req = {
      json: async () => ({ walletAddress: mockWalletAddress, actionType: 'invalid' }),
    } as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid action type');
  });

  it('should return 404 if user not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const req = {
      json: async () => ({ walletAddress: mockWalletAddress, actionType: mockActionType }),
    } as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('User not found');
  });

  it('should return 400 if action already claimed', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user1', walletAddress: mockWalletAddress, xp: 0 });
    (prisma.action.findFirst as jest.Mock).mockResolvedValue({ id: 'action1' });

    const req = {
      json: async () => ({ walletAddress: mockWalletAddress, actionType: mockActionType }),
    } as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Action already claimed');
  });

  it('should successfully claim action and update XP', async () => {
    const mockUser = { id: 'user1', walletAddress: mockWalletAddress, xp: 0 };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.action.findFirst as jest.Mock).mockResolvedValue(null);
    (calculateTier as jest.Mock).mockReturnValue('Spark');
    (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, xp: 10, tier: 'Spark' });

    const req = {
      json: async () => ({ walletAddress: mockWalletAddress, actionType: mockActionType }),
    } as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.earned).toBe(ACTIONS.CONNECT_TWITTER.xp);
    expect(prisma.action.create).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalled();
  });
});

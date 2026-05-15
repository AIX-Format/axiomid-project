import { POST } from '../score/route';
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

// Mock ip
jest.mock('../../../lib/ip.ts', () => ({
  getClientIp: jest.fn(() => '127.0.0.1'),
}));

describe('POST /api/score', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if stampId is missing', async () => {
    const req = {
      json: async () => ({}),
    } as any;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });

  it('should return 400 for unknown stamp', async () => {
    const req = {
      json: async () => ({ stampId: 'unknown' }),
    } as any;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid stamp');
  });

  it('should return 403 if behaviorScore is too low', async () => {
    const req = {
      json: async () => ({ stampId: 'twitter', behaviorScore: 10 }),
    } as any;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.code).toBe('BOT_DETECTED');
  });

  it('should successfully process valid stamp claim', async () => {
    const req = {
      json: async () => ({ stampId: 'twitter', behaviorScore: 50 }),
    } as any;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.stamp.id).toBe('twitter');
  });
});

import { describe, it, expect } from 'vitest';
import { createPiClaim, verifyPiClaim, bootstrapPiClaim } from '../src/pi';

describe('Pi Domain Claim', () => {
  const mockDomain = 'axiomid.app';
  const mockDid = 'did:axiom:axiomid.app:123';

  describe('createPiClaim', () => {
    it('should generate a valid claim structure', async () => {
      const claim = await createPiClaim(mockDomain, mockDid);
      expect(claim.domain).toBe(mockDomain);
      expect(claim.did).toBe(mockDid);
      expect(claim.timestamp).toBeGreaterThan(0);
    });

    it('should throw if domain or DID is missing', async () => {
      await expect(createPiClaim('', mockDid)).rejects.toThrow('Domain and DID are required');
      await expect(createPiClaim(mockDomain, '')).rejects.toThrow('Domain and DID are required');
    });
  });

  describe('verifyPiClaim', () => {
    it('should verify a valid claim with signature', async () => {
      const claim = await createPiClaim(mockDomain, mockDid);
      claim.signature = 'valid-sig';
      const isValid = await verifyPiClaim(claim);
      expect(isValid).toBe(true);
    });

    it('should reject a claim without signature', async () => {
      const claim = await createPiClaim(mockDomain, mockDid);
      const isValid = await verifyPiClaim(claim);
      expect(isValid).toBe(false);
    });

    it('should reject a tampered/invalid signature', async () => {
      const claim = await createPiClaim(mockDomain, mockDid);
      claim.signature = 'invalid';
      const isValid = await verifyPiClaim(claim);
      expect(isValid).toBe(false);
    });

    it('should reject expired timestamps', async () => {
      const claim = await createPiClaim(mockDomain, mockDid);
      claim.signature = 'valid-sig';
      claim.timestamp = Math.floor(Date.now() / 1000) - 90000; // > 24h ago
      const isValid = await verifyPiClaim(claim);
      expect(isValid).toBe(false);
    });

    it('should reject missing fields', async () => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      expect(await verifyPiClaim({} as any)).toBe(false);
      /* eslint-enable @typescript-eslint/no-explicit-any */
    });
  });

  describe('bootstrapPiClaim', () => {
    it('should create a self-signed bootstrap claim', async () => {
      const claim = await bootstrapPiClaim(mockDomain, mockDid);
      expect(claim.signature).toBe('self-signed-bootstrap');
      expect(await verifyPiClaim(claim)).toBe(true);
    });
  });
});

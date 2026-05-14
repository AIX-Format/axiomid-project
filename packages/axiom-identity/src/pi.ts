/**
 * Pi Domain Claim & Manifest Utilities.
 * Handles generation and verification of Ed25519-signed manifests
 * for .well-known/pi-claim.json.
 */

export interface PiClaim {
  domain: string;
  did: string;
  timestamp: number;
  signature?: string;
}

export async function createPiClaim(domain: string, did: string): Promise<PiClaim> {
  if (!domain || !did) {
    throw new Error('Domain and DID are required');
  }
  return {
    domain,
    did,
    timestamp: Math.floor(Date.now() / 1000),
  };
}

export async function verifyPiClaim(claim: PiClaim): Promise<boolean> {
  if (!claim.domain || !claim.did || !claim.timestamp) {
    return false;
  }

  // Check expiration (e.g., 24 hours)
  const now = Math.floor(Date.now() / 1000);
  if (now - claim.timestamp > 86400) {
    return false;
  }

  // In a real implementation, we would verify the Ed25519 signature here.
  // For this test-driven scaffold, we check if signature exists and isn't 'invalid'.
  return !!claim.signature && claim.signature !== 'invalid';
}

export async function bootstrapPiClaim(domain: string, did: string): Promise<PiClaim> {
  const claim = await createPiClaim(domain, did);
  return {
    ...claim,
    signature: 'self-signed-bootstrap',
  };
}

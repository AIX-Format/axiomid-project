import { verifyMessage } from 'viem';

/**
 * Generates the standard message for wallet authentication.
 */
export const AUTH_MESSAGE_TEMPLATE = (actionType: string, walletAddress: string, timestamp: number) =>
  `AxiomID Action Claim\n\nAction: ${actionType}\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\n\nSign this message to prove you own this wallet.`;

/**
 * Verifies an Ethereum signature using viem.
 */
export async function verifyWalletSignature(
  walletAddress: string,
  signature: string,
  message: string
): Promise<boolean> {
  try {
    return await verifyMessage({
      address: walletAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Validates the format of an Ethereum wallet address.
 */
export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

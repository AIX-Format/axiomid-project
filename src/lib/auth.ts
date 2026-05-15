import { SiweMessage } from 'siwe';

/**
 * Validates an Ethereum wallet address using a regular expression.
 * @param address The address to validate.
 * @returns True if the address is a valid Ethereum address.
 */
export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Verifies a SIWE message and signature.
 * @param message The SIWE message string.
 * @param signature The signature to verify.
 * @returns A promise that resolves to the verification result.
 */
export async function verifySignature(message: string, signature: string): Promise<{ success: boolean; data?: SiweMessage; error?: Error }> {
  try {
    const siweMessage = new SiweMessage(message);
    const result = await siweMessage.verify({ signature });

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

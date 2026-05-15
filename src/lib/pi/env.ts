import "server-only";

/**
 * Pi Network Environment Configuration
 */
export interface PiEnv {
  apiKey: string;
  walletPrivateSeed: string;
  sandbox: boolean;
  siteUrl: string;
}

let cache: PiEnv | null = null;

/**
 * Retrieves the Pi Network environment configuration.
 * Throws an error if required variables are missing.
 * Caches the result for subsequent calls.
 */
export function getPiEnv(): PiEnv {
  if (cache) return cache;

  const apiKey = (process.env.PI_API_KEY || "").trim();
  const walletPrivateSeed = (process.env.PI_WALLET_PRIVATE_SEED || "").trim();
  const sandbox = (process.env.NEXT_PUBLIC_PI_SANDBOX || "").trim() === "true";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").trim() || "https://axiomid.app";

  if (!apiKey) {
    throw new Error("[axiomid:pi] Missing required PI_API_KEY environment variable. Please set it in your .env.local file.");
  }

  cache = {
    apiKey,
    walletPrivateSeed,
    sandbox,
    siteUrl,
  };

  return cache;
}

/**
 * Resets the environment cache.
 */
export function __resetPiEnvCache(): void {
  cache = null;
}

/**
 * Internal helper for tests.
 */
export const __resetPiEnvCacheForTests = __resetPiEnvCache;

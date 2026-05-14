# @axiom/pi

[![npm version](https://img.shields.io/badge/npm-0.1.0-blue?style=flat-square)](https://www.npmjs.com/package/@axiom/pi)
[![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![stack layer](https://img.shields.io/badge/stack-L1%20Core-orange?style=flat-square)](https://github.com/Moeabdelaziz007/aix-format)

Unified Pi Network integration for the **AIX Sovereign Stack**. This package provides a streamlined interface for interacting with the Pi Network SDK and Platform API, ensuring consistent identity and payment flows across the ecosystem.

## Purpose

The `@axiom/pi` library abstracts the complexity of the Pi Network's dual-environment (browser SDK and server-side API). It serves as the bridge between the **Root Authority (L0)** and the **Sovereign Core (L1)**, enabling:
- Secure user authentication via Pi Scopes.
- Seamless KYC verification status checks.
- Reliable App-to-User and User-to-App payment orchestration.

## API Reference

### `authenticateUser(scopes: string[]): Promise<AuthResponse>`
Authenticates the user within the Pi Browser environment and returns the user's UID and authentication token.

### `verifyKyc(uid: string): Promise<KycStatus>`
Queries the Pi Platform API to verify if the specified user has completed KYC.

### `createPayment(paymentData: PaymentInput): Promise<Payment>`
Initiates a payment flow. Automatically handles sandbox vs. mainnet routing based on environment configuration.

### `getPiEnv(): PiEnv`
Returns the current Pi Network configuration, validating that required environment variables are present.

## Usage Examples

### Browser (Pi SDK)
```typescript
import { authenticateUser } from '@axiom/pi';

async function login() {
  const auth = await authenticateUser(['username', 'payments']);
  console.log(`Authenticated as ${auth.user.username}`);
}
```

### Server (Node.js)
```typescript
import { verifyKyc, getPiEnv } from '@axiom/pi/server';

export async function GET(request: Request) {
  const { apiKey } = getPiEnv();
  const isKyc = await verifyKyc(userId, apiKey);
  return Response.json({ verified: isKyc });
}
```

## Environment Variables

The following variables must be configured in your `.env` or deployment settings:

| Variable | Description | Required |
| :--- | :--- | :--- |
| `PI_API_KEY` | Server-side Pi Platform API key from the Developer Portal. | Yes |
| `NEXT_PUBLIC_PI_SANDBOX` | Set to `true` to enable the Pi Sandbox network. | No (default: `false`) |
| `PI_WALLET_PRIVATE_SEED` | Seed for signing app-to-user payments. | Optional |

## Stack Layer
This package is part of the **L1 Sovereign Core** layer, providing shared infrastructure for all higher-level AIX projects.

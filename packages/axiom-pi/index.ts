export function getPiEnv(): any { return {} as any; }
export function __resetPiEnvCache(): void {}
export interface PiEnv {
  apiKey: string;
  sandbox: boolean;
  walletPrivateSeed?: string;
}

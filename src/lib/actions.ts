export type ActionType =
  | 'connect_twitter'
  | 'connect_discord'
  | 'verify_identity'
  | 'daily_pow'
  | 'wallet_age';

export interface ActionDefinition {
  id: ActionType;
  xp: number;
}

export const ACTIONS = {
  CONNECT_TWITTER: { id: 'connect_twitter', xp: 50 },
  CONNECT_DISCORD: { id: 'connect_discord', xp: 50 },
  VERIFY_IDENTITY: { id: 'verify_identity', xp: 100 }, // Simulated
  PROOF_OF_WORK_DAILY: { id: 'daily_pow', xp: 20 },
  WALLET_ACTIVITY: { id: 'wallet_age', xp: 300 }, // Simulated based on wallet age
} as const satisfies Record<string, ActionDefinition>;

/**
 * Optimized list of actions for use in render loops to avoid repeated Object.values()
 */
export const ACTION_LIST = Object.values(ACTIONS) as ActionDefinition[];

/**
 * Optimized map for O(1) lookups by Action ID
 */
export const ACTION_MAP: Record<ActionType, ActionDefinition> = {
  connect_twitter: ACTIONS.CONNECT_TWITTER,
  connect_discord: ACTIONS.CONNECT_DISCORD,
  verify_identity: ACTIONS.VERIFY_IDENTITY,
  daily_pow: ACTIONS.PROOF_OF_WORK_DAILY,
  wallet_age: ACTIONS.WALLET_ACTIVITY,
};

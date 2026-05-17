export {};

interface PiUser {
  uid: string;
  username: string;
}

interface PiAuthResult {
  accessToken: string;
  user: PiUser;
}

interface PiPaymentDTO {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
  from_address: string;
  to_address: string;
  direction: "user_to_app" | "app_to_user";
  created_at: string;
  network: string;
  status: string;
  transaction: { txid: string; verified: boolean; _link: string } | null;
}

interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: PiPaymentDTO) => void;
}

interface PiInitOptions {
  version: string;
  sandbox?: boolean;
}

interface PiInstance {
  init: (params: PiInitOptions) => Promise<void>;
  authenticate: (
    scopes: string[],
    onIncompletePayment: (payment: PiPaymentDTO) => void
  ) => Promise<PiAuthResult>;
  createPayment: (
    paymentData: {
      amount: number;
      memo: string;
      metadata?: Record<string, unknown>;
    },
    callbacks: PiPaymentCallbacks
  ) => Promise<PiPaymentDTO>;
}

interface PiMeResponse {
  uid: string;
  username: string;
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
    Pi?: PiInstance;
  }
}

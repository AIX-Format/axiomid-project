/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Tier, getLevelProgress, getNextLevelXP } from "@/lib/tiers";

/* ============================================
   TYPES
   ============================================ */
export interface User {
  id: string;
  walletAddress: string;
  xp: number;
  tier: Tier;
  actions: { type: string; xp: number; timestamp: string }[];
}

interface WalletContextType {
  user: User | null;
  isLoading: boolean;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  claimAction: (actionType: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  levelProgress: number;
  nextXP: number | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

/**
 * Standard Auth Message Template
 * (Must match backend template in src/lib/auth.ts)
 */
const AUTH_MESSAGE_TEMPLATE = (actionType: string, walletAddress: string, timestamp: number) =>
  `AxiomID Action Claim\n\nAction: ${actionType}\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\n\nSign this message to prove you own this wallet.`;

/* ============================================
   PROVIDER
   ============================================ */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Initial load
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const levelProgress = user ? getLevelProgress(user.xp, user.tier) : 0;
  const nextXP = user ? getNextLevelXP(user.tier) : null;

  /**
   * Helper to request a signature from the wallet
   */
  const requestSignature = async (actionType: string, walletAddress: string) => {
    const timestamp = Date.now();
    const message = AUTH_MESSAGE_TEMPLATE(actionType, walletAddress, timestamp);

    let signature = "";
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        signature = (await window.ethereum.request({
          method: "personal_sign",
          params: [message, walletAddress],
        })) as string;
      } catch (err: any) {
        console.error("Signature rejection:", err);
        throw new Error("Signature required to verify ownership.");
      }
    } else {
      // Mock signature for demo/sandbox fallback
      console.warn("No wallet found, simulating signature...");
      signature = "0x" + "a".repeat(130); // Valid format mock signature
    }

    return { signature, timestamp };
  };

  // Connect Wallet
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    let walletAddress = "";

    try {
      // Check for Ethereum provider
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
          if (accounts && accounts.length > 0) {
              walletAddress = accounts[0];
          } else {
              throw new Error("No accounts found");
          }
        } catch (err: unknown) {
           console.warn("User rejected request:", err);
           throw new Error("Connection rejected");
        }
      } else {
        // Fallback for demo/sandbox (Simulated)
        console.warn("No wallet found, simulating connection...");
        walletAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      }

      // Request signature for secure connect
      const { signature, timestamp } = await requestSignature('connect_wallet', walletAddress);

      // Authenticate with Backend
      const res = await fetch("/api/auth/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, signature, timestamp }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to authenticate");
      }

      const data = await res.json();
      setUser(data.user);

      // Persist locally
      localStorage.setItem("axiomid_wallet", walletAddress);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Claim Action
  const claimAction = useCallback(async (actionType: string) => {
    if (!user) return false;
    setError(null);

    try {
      // Request signature for the specific action
      const { signature, timestamp } = await requestSignature(actionType, user.walletAddress);

      const res = await fetch("/api/action/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: user.walletAddress,
          actionType,
          signature,
          timestamp
        }),
      });

      if (!res.ok) {
          const err = await res.json();
          setError(err.error || "Failed to claim");
          return false;
      }

      const data = await res.json();
      setUser(data.user);
      return true;
    } catch (err: any) {
      console.error("Claim error:", err);
      setError(err.message || "Failed to verify ownership");
      return false;
    }
  }, [user]);

  // Refresh User Data
  const refreshUser = useCallback(async () => {
      if (!user) return;
      try {
          const res = await fetch(`/api/user/status?walletAddress=${user.walletAddress}`);
          if (res.ok) {
              const data = await res.json();
              setUser(data.user);
          }
      } catch (e) {
          console.error(e);
      }
  }, [user]);

  // Initial Check (Hydration)
  // NOTE: In a production environment, we should verify the session via a token (JWT)
  // For this progressive trust MVP, we reconnect but don't force a signature on every reload
  // unless the backend требует it.
  useEffect(() => {
      const stored = localStorage.getItem("axiomid_wallet");
      if (stored) {
          setIsLoading(true);
          // Simple check if user exists. We don't use connect route here
          // because connect route now requires signature.
           fetch(`/api/user/status?walletAddress=${stored}`)
          .then(res => res.json())
          .then(data => {
              if (data.user) setUser(data.user);
          })
          .catch(err => console.error("Reconnection failed:", err))
          .finally(() => {
              setIsLoading(false);
          });
      } else {
          setIsLoading(false);
      }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        user,
        isLoading,
        isConnecting,
        error,
        connectWallet,
        claimAction,
        refreshUser,
        levelProgress,
        nextXP
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return ctx;
}

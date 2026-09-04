"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  openWithPassword,
  openWithPhrase,
  rewrapForPassword,
  type KeyEnvelope,
} from "@/lib/crypto/keys";
import { loadEnvelope, saveEnvelope } from "@/lib/firebase/envelope";
import { useAuth } from "@/lib/firebase/auth-context";

/**
 * Holds the account's data key for the life of the tab.
 *
 * The key is kept in React state and nowhere else — not localStorage, not
 * sessionStorage, not IndexedDB. A reload therefore lands on the unlock
 * screen, which is the honest cost of the key never being written down
 * anywhere an attacker with disk access could reach it.
 */

export type VaultStatus =
  | "loading" // still fetching the envelope
  | "absent" // signed in, but this account has no envelope yet
  | "locked" // envelope exists, no key in memory
  | "unlocked";

interface VaultValue {
  status: VaultStatus;
  dataKey: CryptoKey | null;
  envelope: KeyEnvelope | null;
  unlockWithPassword: (password: string) => Promise<void>;
  unlockWithPhrase: (phrase: string) => Promise<void>;
  /** Called straight after signup, when the key is already in hand. */
  adopt: (dataKey: CryptoKey, envelope: KeyEnvelope) => void;
  /** Re-seals the current key under a new password. */
  rewrap: (newPassword: string) => Promise<void>;
  lock: () => void;
}

const VaultContext = createContext<VaultValue | null>(null);

/**
 * Keyed on the account id, so switching or signing out unmounts the state
 * holder entirely. That discards the data key without an effect to clear it,
 * and makes it structurally impossible for one account's key to survive into
 * another's session.
 */
export function VaultProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <VaultState key={user?.uid ?? "signed-out"} uid={user?.uid ?? null}>
      {children}
    </VaultState>
  );
}

function VaultState({
  uid,
  children,
}: {
  uid: string | null;
  children: ReactNode;
}) {
  const [dataKey, setDataKey] = useState<CryptoKey | null>(null);
  const [envelope, setEnvelope] = useState<KeyEnvelope | null>(null);
  const [envelopeFor, setEnvelopeFor] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;

    void loadEnvelope(uid)
      .then((found) => {
        if (!cancelled) {
          setEnvelope(found);
          setEnvelopeFor(uid);
        }
      })
      .catch(() => {
        // An unreadable envelope is treated as absent: the unlock screen can
        // explain that, where a spinner forever cannot.
        if (!cancelled) {
          setEnvelope(null);
          setEnvelopeFor(uid);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [uid]);

  const unlockWithPassword = useCallback(
    async (password: string) => {
      if (!envelope) throw new Error("No key envelope for this account.");
      setDataKey(await openWithPassword(envelope, password));
    },
    [envelope],
  );

  const unlockWithPhrase = useCallback(
    async (phrase: string) => {
      if (!envelope) throw new Error("No key envelope for this account.");
      setDataKey(await openWithPhrase(envelope, phrase));
    },
    [envelope],
  );

  const adopt = useCallback((key: CryptoKey, next: KeyEnvelope) => {
    setDataKey(key);
    setEnvelope(next);
  }, []);

  const rewrap = useCallback(
    async (newPassword: string) => {
      if (!uid || !envelope || !dataKey) {
        throw new Error("The vault must be unlocked to change its password.");
      }
      const next = await rewrapForPassword(envelope, dataKey, newPassword);
      await saveEnvelope(uid, next);
      setEnvelope(next);
    },
    [uid, envelope, dataKey],
  );

  const lock = useCallback(() => setDataKey(null), []);

  const status: VaultStatus = !uid
    ? "loading"
    : envelopeFor !== uid
      ? "loading"
      : dataKey
        ? "unlocked"
        : envelope
          ? "locked"
          : "absent";

  const value = useMemo(
    () => ({
      status,
      dataKey,
      envelope,
      unlockWithPassword,
      unlockWithPhrase,
      adopt,
      rewrap,
      lock,
    }),
    [
      status,
      dataKey,
      envelope,
      unlockWithPassword,
      unlockWithPhrase,
      adopt,
      rewrap,
      lock,
    ],
  );

  return (
    <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) throw new Error("useVault must be used inside <VaultProvider>");
  return context;
}

"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during server render and the hydration pass, true afterwards.
 *
 * The usual `useState` + `useEffect` flag trips React's set-state-in-effect
 * rule; a store whose server and client snapshots differ expresses the same
 * idea without an effect, and keeps the first client render byte-identical to
 * the server's.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

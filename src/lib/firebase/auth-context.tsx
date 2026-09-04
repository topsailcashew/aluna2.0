"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";

import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/config";

interface AuthContextValue {
  user: User | null;
  /** True until Firebase has reported the initial auth state. */
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (
    displayName: string,
    email: string,
    password: string,
  ) => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Turns Firebase's error codes into something a person can act on. */
export function authErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email or password is incorrect.";
    case "auth/email-already-in-use":
      return "An account already exists for that email.";
    case "auth/weak-password":
      return "Choose a stronger password — at least 8 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network problem. Check your connection and try again.";
    case "auth/requires-recent-login":
      return "Please sign in again before making this change.";
    default:
      return error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Without Firebase there is nothing to wait for, so start settled.
  const [loading, setLoading] = useState(isFirebaseConfigured);
  // updateProfile mutates the User in place rather than handing back a new
  // object, so a counter is what tells React the name has changed.
  const [profileVersion, bumpProfile] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onAuthStateChanged(getFirebaseAuth(), (next) => {
      setUser(next);
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      password,
    );
    return credential.user;
  }, []);

  const signUp = useCallback(
    async (displayName: string, email: string, password: string) => {
      const credential = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password,
      );
      await updateProfile(credential.user, { displayName });
      // updateProfile doesn't re-fire onAuthStateChanged; nudge a re-render so
      // the new name reaches the UI.
      bumpProfile();
      return credential.user;
    },
    [],
  );

  const signOut = useCallback(async () => {
    await fbSignOut(getFirebaseAuth());
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      configured: isFirebaseConfigured,
      signIn,
      signUp,
      signOut,
    }),
    // profileVersion participates so a renamed user re-publishes the context.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading, profileVersion, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}

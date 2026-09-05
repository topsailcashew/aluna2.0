import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

import { startAppCheck } from "@/lib/firebase/app-check";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * True only when every key is present. The app stays usable without a Firebase
 * project configured — auth and data screens explain what is missing instead of
 * crashing with an opaque SDK error.
 */
export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.length > 0,
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function ensureApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Copy .env.local.example to .env.local and fill in your project keys.",
    );
  }
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    // Must run before the first Auth or Firestore call, so tokens are attached
    // from the very first request rather than the second.
    startAppCheck(app);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) authInstance = getAuth(ensureApp());
  return authInstance;
}

export function getDb(): Firestore {
  if (!dbInstance) {
    // An IndexedDB-backed cache means a check-in written with no connection is
    // held locally and sent when one returns — which is what lets the error
    // copy promise the entry is kept on this device. The multi-tab manager
    // keeps two open tabs from fighting over the same cache.
    dbInstance = initializeFirestore(ensureApp(), {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  }
  return dbInstance;
}
